import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: String, //{type:String}과 같다.
    description: String,
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String }],
    mata: {
        views: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
    }
});
const Video = mongoose.model("Video", videoSchema);
export default Video;