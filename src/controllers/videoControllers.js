import Video from '../models/Video';

export const home = async (req, res) => {
    try {
        const videos = await Video.find({});
        return res.render("home", { pageTitle: "Home", videos });
    } catch {
        return res.render("server-error");
    }
};

export const watch = (req, res) => {
    //const id = req.params.id;
    const { id } = req.params;
    return res.render("watch", { pageTitle: `Watching` });
}

export const getEdit = (req, res) => {
    const { id } = req.params;
    return res.render("edit", { pageTitle: `Editing` });
};
export const postEdit = (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    return res.redirect(`/videos/${id}`); //브라우저가 자동으로 우리가 준 url로 이동하게 하는 것
}
export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
}
export const postUpload = (req, res) => {
    const { title } = req.body;
    return res.redirect("/");
}

