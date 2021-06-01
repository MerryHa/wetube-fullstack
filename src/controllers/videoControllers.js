import Video from '../models/Video';

export const home = async (req, res) => {
    const videos = await Video.find({});
    console.log(videos);
    return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: `Edit: ${video.title}`, video });
}

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id); //❗ video는 데이터베이스에서 검색한 영상 object이다.
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("edit", { pageTitle: `Editing`, video });
};
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { description, title, hashtags } = req.body;
    const video = await Video.exists({ _id: id });
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    await Video.findByIdAndUpdate(id, { //❗ Video는 Model이다.
        title,
        description,
        hashtags: hashtags
            .split(",")
            .map(word => word.startsWith("#") ? word : `#${word}`)
    });
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
            hashtags: hashtags.split(",").map(word => word.startsWith("#") ? word : `#${word}`),
        });
        return res.redirect("/");
    } catch (err) {
        return res.render("upload", {
            pageTitle: "Upload Video",
            err: err._message,
        });
    }
}