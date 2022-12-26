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
  console.log(propertyID);

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

  console.log(ratingStats);

  if (ratingStats.length > 0) {
    await Property.findByIdAndUpdate(propertyID, {
      ratingsQuantity: ratingStats[0].nRating,
      ratingsAverage: ratingStats[0].avgRating,
    });
  } else {
    await Property.findByIdAndUpdate(propertyID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", async function () {
  //@ts-ignore
  await this.constructor.calcAverageRatings(this.property);
});

reviewSchema.pre(/^findByIdAnd/, async function (next) {
  //@ts-ignore
  this.rev = await this.findOne();
  //@ts-ignore
  console.log(this.rev);

  next();
});

reviewSchema.post(/^findByIdAnd/, async function () {
  //@ts-ignore
  await this.rev.constructor.calcAverageRatings(this.rev.property);
});

const Review = mongoose.model("review", reviewSchema);

export default Review;
