import User from '../models/User';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import { token } from 'morgan';

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
        console.log(error);
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
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const config = {
        client_id: process.env.GH_CLIENT,//깃헙이 어떤 어플에 로그인(회원가입)하는지 알 수 있다.
        allow_signup: false,//어플에 어떤 종류의 user를 허용 시킬건지 설정
        scope: "read:user user:email", //user로 뭘 할건지 설정
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    //fetch로 데이터 받아오기
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
            return res.redirect("/login"); //임시
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
        return res.redirect("/login"); //임시 ->이후엔 에러 notification 보여주면서 redirect
    }
};
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}
//변경 안했을 경우도 생각해야함
export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;

    const findUsername = await User.findOne({ username });
    if (findUsername && findUsername._id != _id) {
        return res.render("edit-profile", {
            pageTitle: "Edit Profile",
            error: "This username already exists."
        })
    }

    const findEmail = await User.findOne({ email });
    if (findEmail && findEmail._id != _id) {
        return res.render("edit-profile", {
            pageTitle: "Edit Profile",
            error: "This email already exists."
        })
    }

    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,
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
            error: "The current password is incorrect."
        });
    }
    if (newPwd !== newPwd2) {
        return res.status(400).render("user/change-password", {
            pageTitle: "Change Password",
            error: "Thw password does not match the confirmation."
        });
    }
    user.password = newPwd;
    await user.save();
    return res.redirect("/users/logout");
}
export const see = (req, res) => res.send("See User");