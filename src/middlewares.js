export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user;
    //처음엔(로그인하기 전엔) req.session.user가 undefined이다.
    //유저가 로그인 되어있지 않을 땐 loggedInUser를 사용하지 않도록 pug를 만들어야함.
    console.log(res.locals);
    next();
};