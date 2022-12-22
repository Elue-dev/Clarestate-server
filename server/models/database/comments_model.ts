import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({});

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
