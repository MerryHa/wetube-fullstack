import Video from '../models/Video';

export const home = async (req, res) => {
    const videos = await Video.find({});
    console.log(videos);
    return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
    //const id = req.params.id;
    const { id } = req.params;
    const video = await Video.findById(id);
    return res.render("watch", { pageTitle: video.title, video });
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
export const postUpload = async (req, res) => {
    const { title, description, hashtags } = req.body;
    try {
        await Video.create({
            title,
            description,
            hashtags: hashtags.split(",").map(word => `#${word}`),
        });
        return res.redirect("/");
    } catch (err) {
        return res.render("upload", {
            pageTitle: "Upload Video",
            err: err._message,
        });
    }
}