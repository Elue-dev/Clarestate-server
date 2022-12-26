import mongoose from "mongoose";
import slugify from "slugify";

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Property price is required"],
    },
    location: {
      type: String,
      required: [true, "Property location is required"],
      trim: true,
    },
    images: {
      type: [String],
      required: [true, "Images of property is required"],
    },
    features: {
      type: [String],
      required: [true, "Please specify key features of this property"],
    },
    availability: {
      type: String,
      required: [true, "Please specify the availability of this property"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "A property must have a rating of at least 1"],
      max: [5, "A property cannot have a rating of more than 5"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    purpose: {
      type: String,
      required: [true, "Please specify the purpose of this property"],
      enum: {
        values: ["Sale", "Rent", "Shortlet"],
        message:
          "Propery purpose must be one of the following: Sale, Rent or Shortlet",
      },
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A property must have a description"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Please specify the number of bedrooms"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Please specify the number of bathrooms"],
    },
    toilets: {
      type: Number,
      required: [true, "Please specify the number of toilets"],
    },
    agentName: {
      type: String,
      required: [true, "Please specify the agent name"],
    },
    agentContact: {
      type: String,
      required: [true, "Please specify the agent contact"],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    slug: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

propertySchema.index({ price: 1, ratingsAverage: -1 });

propertySchema.index({ slug: 1 });

propertySchema.virtual("reviews", {
  ref: "review",
  foreignField: "property",
  localField: "_id",
});

propertySchema.virtual("comments", {
  ref: "comment",
  foreignField: "property",
  localField: "_id",
});

propertySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

propertySchema.pre(/^findOne/, function (next) {
  this.populate({
    path: "addedBy",
    select: "first_name last_name photo",
  });

  next();
});

const Property = mongoose.model("property", propertySchema);

export default Property;
