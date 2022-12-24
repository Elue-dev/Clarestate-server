import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Your comment is required"],
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: [true, "A comment must belong to a property"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A comment must belong to a user"],
  },
});

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
