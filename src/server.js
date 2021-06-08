import express from "express";
import morgan from "morgan";
import session from "express-session";

import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";


const app = express();
const logger = morgan("dev");

app.set("views", process.cwd() + "/src/views");
app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(
    session({
        secret: "Hello",
        resave: true,
        saveUninitialized: true,
    })
)
// app.use((req, res, next) => {
//     console.log(req.headers);
//     next();
// })
app.use((req, res, next) => {
    req.sessionStore.all((error, sessions) => {
        console.log(sessions);
        next();
    })
})
// app.get("/add-one", (req, res, next) => {
//     req.session.potato += 1;
//     return res.send(`${req.session.id}\n${req.session.potato}`);
// })
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/user", userRouter);

export default app;

