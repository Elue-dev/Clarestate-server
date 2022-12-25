import mongoose from "mongoose";
import Property from "./property_model";

const reviewSchema = new mongoose.Schema(
  {
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
      ref: "property",
      required: [true, "A review must belong to a property"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "A review must belong to a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ property: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "first_name last_name photo",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (propertyID) {
  const ratingStats = await this.aggregate([
    {
      $match: { property: propertyID },
    },
    {
      $group: {
        _id: "$property",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Property.findByIdAndUpdate(propertyID, {
    ratingsQuantity: ratingStats[0].nRating,
    ratingsAverage: ratingStats[0].avgRating,
  });
};

reviewSchema.post("save", function () {
  //@ts-ignore
  this.constructor.calcAverageRatings(this.property);
});

const Review = mongoose.model("review", reviewSchema);

export default Review;
