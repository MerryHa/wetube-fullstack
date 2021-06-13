import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    //user가 github로 로그인했는지 여부를 알기 위해 정의함
    //로그인 페이지에서 user가 email로 로그인하려는데 패스워드가 없을 때 socialOnly를 체크하면 된다.
    username: { type: String, required: true, unique: true },
    password: String,
    name: { type: String, required: true },
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
});
userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 5);
})

const User = mongoose.model("User", userSchema);
export default User;
