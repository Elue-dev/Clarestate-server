import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Your comment is required"],
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: [true, "A comment must belong to a property"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "A comment must belong to a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username photo",
  });

  next();
});

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
