import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: String, //{type:String}과 같다.
    description: String, //{type:String}과 같다.
    createdAt: Date,
    hashtags: [{ type: String }],
    mata: {
        views: Number,
        rating: Number,
    }
});
const movieModel = mongoose.model("Video", videoSchema);
export default movieModel;