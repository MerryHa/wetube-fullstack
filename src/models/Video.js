import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, maxLength: 80 }, //{type:String}과 같다.
    description: { type: String, required: true, minLength: 20 },
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, required: true, trim: true }],
    mata: {
        views: { type: Number, default: 0, required: true },
        rating: { type: Number, default: 0, required: true },
    }
});
const Video = mongoose.model("Video", videoSchema);
export default Video;