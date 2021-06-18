import multer from 'multer';

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};
    next();
};

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/login");
    }
}
export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}
export const avatarUploadMiddleware = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000
    }
}) // byte단위
export const videoUploadMiddleware = multer({
    dest: "uploads/videos/",
    limits: {
        fileSize: 1000000
    }
})