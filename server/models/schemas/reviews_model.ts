import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Please leave your review"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please leave a rating"],
  },
  tour: {
    //parent referencing
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: [true, "A review must belong to a tour"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A review must belong to a user"],
  },
});

const Review = mongoose.model("review", reviewSchema);

export default Review;
