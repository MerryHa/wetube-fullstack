import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: String, //{type:String}과 같다.
    description: String,
    createdAt: { type: Date },
    hashtags: [{ type: String }],
    mata: {
        views: Number,
        rating: Number,
    }
});
const Video = mongoose.model("Video", videoSchema);
export default Video;