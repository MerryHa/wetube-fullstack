import { CodeStarNotifications } from 'aws-sdk';
import Comment from '../models/Comment';
import User from '../models/User';
import Video from '../models/Video';

export const home = async (req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if (!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video });
}

export const getEdit = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        params: { id }
    } = req;

    const video = await Video.findById(id); //❗ video는 데이터베이스에서 검색한 영상 object이다.
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== _id) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        params: { id },
        body: { description, title, hashtags }

    } = req;
    const video = await Video.findOne({ _id: id });
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== _id) {
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, { //❗ Video는 Model이다.
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    });
    req.flash("info", "Changes saved.");
    return res.redirect(`/videos/${id}`); //브라우저가 자동으로 우리가 준 url로 이동하게 하는 것
}
export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
}
export const postUpload = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        files: { video, thumb },
        body: { title, description, hashtags }
    } = req;
    const isHeroku = process.env.NODE_ENV === "production";
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: isHeroku ? video[0].location : video[0].path,
            thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
}
export const deleteVideo = async (req, res) => {
    const {
        session: {
            user: { _id: userId },
        },
        params: { id: videoId },
    } = req;
    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== userId) {
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    }
    const user = await User.findById(userId);
    const deleted = user.videos.filter(x => x != videoId);
    user.videos = deleted;
    await user.save();
    await Video.findByIdAndDelete(videoId);
    return res.redirect('/');
}
export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: { $regex: new RegExp(keyword, "i") }
        }).populate("owner");
    }
    return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views += 1;
    await video.save();
    return res.sendStatus(200);
};

export const createComment = async (req, res) => {
    const {
        params: { id },
        body: { text },
        session: { user },
    } = req;
    const video = await Video.findById(id);
    if (!video) {
        return res.senStatus(404);
    }
    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id,
    });
    video.comments.push(comment._id);
    await video.save();
    return res.status(201).json({ newCommentId: comment._id });
}
export const deleteComment = async (req, res) => {
    const {
        params: { id: commentId },
        session: { user },
        body: videoId,
    } = req;
    const findComment = await Comment.findOne({ _id: commentId }).populate("owner");
    if (String(findComment.owner._id) !== user._id) {
        return res.sendStatus(404);
    }
    await Comment.findByIdAndRemove(commentId);
    const video = await Video.findById(videoId);
    video.comments = video.comments.filter(x => x != commentId);
    await video.save();
    return res.sendStatus(200);
};