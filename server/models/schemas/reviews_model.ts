import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Please leave your review"],
  },
  rating: {
    type: Number,
    min: [1, "A property must have a rating of at least 1"],
    max: [5, "A property cannot have a rating of more than 5"],
    required: [true, "Please leave a rating"],
  },
  property: {
    //parent referencing
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: [true, "A review must belong to a property"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A review must belong to a user"],
  },
});

const Review = mongoose.model("review", reviewSchema);

export default Review;
