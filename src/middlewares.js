import multer from 'multer';

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};
    //처음엔(로그인하기 전엔) req.session.user가 undefined이다.
    //유저가 로그인 되어있지 않을 땐 loggedInUser를 사용하지 않도록 pug를 만들어야함.
    next();
};

export const protectorMiddleware = (req, res, next) => {
    //로그인O => 요청 계속
    //로그인X => 로그인 페이지로 redirect
    if (req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
}
export const publicOnlyMiddleware = (req, res, next) => {
    //위의 반대
    if (!req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/");
    }
}
export const uploadFilesMiddleware = multer({ dest: "uploads/" })