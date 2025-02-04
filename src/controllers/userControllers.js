import User from '../models/User';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    const { name, email, username, password, password2, location } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }

    const exists = await User.exists({ $or: [{ email }, { username }] });
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This email/username is already taken.",
        });
    }
    try {
        await User.create({
            name,
            email,
            username,
            password,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: error._message,
        });
    }
};
export const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username, socialOnly: false });
    if (!user) {
        return res
            .status(400)
            .render("login", {
                pageTitle,
                errorMessage: "An account with this username does not exists.",
            });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res
            .status(400)
            .render("login", {
                pageTitle,
                errorMessage: "Wrong password",
            });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}
export const startGithubLogin = (req, res) => {
    const isHeroku = process.env.NODE_ENV === "production";
    console.log(isHeroku);
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const config = {
        client_id: isHeroku ? process.env.GH_CLIENT : process.env.GH_DEV_CLIENT,//깃헙이 어떤 어플에 로그인(회원가입)하는지 알 수 있다.
        allow_signup: false,//어플에 어떤 종류의 user를 허용 시킬건지 설정
        scope: "read:user user:email", //user로 뭘 할건지 설정
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}
export const finishGithubLogin = async (req, res) => {
    const isHeroku = process.env.NODE_ENV === "production";
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: isHeroku ? process.env.GH_CLIENT : process.env.GH_DEV_CLIENT,
        client_secret: isHeroku ? process.env.GH_SECRET : process.env.GH_DEV_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                //json을 리턴받기 위해서 Accept:"application/json"을 headers에 보내야함 그렇지 않으면 깃허브가 text로 응답
            }
        })
    ).json();

    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(email => email.primary === true && email.verified === true);
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = await User.create({
                name: userData.name,
                avatarUrl: userData.avatar_url,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");

    } else {
        req.flash("error", "Access token does not exist. ");
        return res.redirect("/login");
    }
};
export const logout = (req, res) => {
    // req.flash("info", "Bye Bye");
    req.session.destroy();
    return res.redirect("/");
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}

export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;

    const pageTitle = "Edit Profile";
    const findUsername = await User.findOne({ username });
    if (findUsername && findUsername._id != _id) {
        return res.render("edit-profile", {
            pageTitle,
            error: "This username already exists."
        })
    }
    const findEmail = await User.findOne({ email });
    if (findEmail && findEmail._id != _id) {
        return res.render("edit-profile", {
            pageTitle,
            error: "This email already exists."
        })
    }
    const isHeroku = process.env.NODE_ENV === "production";
    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
        name,
        email,
        username,
        location
    }, { new: true })
    req.session.user = updatedUser;
    // {new:false} : 이전 데이터를 리턴, {new:true} : 업데이트된 데이터를 리턴
    return res.redirect("/users/edit");
}
export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        req.flash("error", "Can't change password");
        return res.redirect("/");
    }
    return res.render("user/change-password", { pageTitle: "Change Password" });
}
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id }
        },
        body: { oldPwd, newPwd, newPwd2 }
    } = req;

    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPwd, user.password);
    if (!ok) {
        return res.status(400).render("user/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect."
        });
    }
    if (newPwd !== newPwd2) {
        return res.status(400).render("user/change-password", {
            pageTitle: "Change Password",
            errorMessage: "Thw password does not match the confirmation."
        });
    }
    user.password = newPwd;
    await user.save();
    req.flash("info", "Password updated");
    return res.redirect("/users/logout");
}
export const see = async (req, res) => {
    //모든 사람이 볼 수 있어야 하므로 (유튜브 채널처럼) 세션이 아니라 url에서 아이디를 받아오자.
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if (!user) {
        return res.status(404).render("404", { pageTitle: "⛔User not found!" })
    }
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
}