import { Request, Response, NextFunction } from "express";
import Property from "../models/schemas/property_model";
import handleAsync from "../utils/handle_async";
import cloudinary from "cloudinary";
import { upload } from "../utils/file_upload";
import { GlobalError } from "../utils/global_error";
import { APIFeatures } from "../services/api_features";
import Review from "../models/schemas/reviews_model";
import { redisClient } from "../app";

const cloud = cloudinary.v2;

export const createProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    cloud.config({
      cloud_name: process.env.CLOUD_NAME as string,
      api_key: process.env.CLOUDINARY_KEY as string,
      api_secret: process.env.CLOUDINARY_SECRET as string,
    });

    let uploadedFiles: any = [];

    req.body.images = [];

    await Promise.all(
      // @ts-ignore
      req.files.map(async (file: any) => {
        uploadedFiles = await cloud.uploader.upload(file.path, {
          folder: "Clarestate",
          resource_type: "image",
        });
        await req.body.images.push(uploadedFiles.secure_url);
      })
    );

    const property = await Property.create(req.body);

    res.status(201).json({
      status: "success",
      property,
    });
  }
);

export const getAllProperties = handleAsync(
  async (req: Request, res: Response) => {
    //@ts-ignore
    const cachedProperties = await redisClient.get("clarProp");

    if (cachedProperties) {
      return res.status(200).json({
        status: "success from redis",
        // results: cachedProperties.length,
        properties: JSON.parse(cachedProperties),
      });
    }

    //@ts-ignore
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .sort()
      .limitFields();

    //@ts-ignore
    const properties = await features.query;

    await redisClient.set("clarProp", JSON.stringify(properties));

    res.status(200).json({
      status: "success",
      // results: properties.length,
      properties,
    });
  }
);

export const getSingleProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    //@ts-ignore
    const cachedProperty = await redisClient.get(slug);

    if (cachedProperty) {
      return res.status(200).json({
        status: "success",
        property: JSON.parse(cachedProperty),
      });
    }

    const property = await Property.findOne({ slug })
      .populate("reviews")
      .populate("comments");

    await redisClient.set(slug, JSON.stringify(property));

    if (!property) {
      return next(new GlobalError("Property not found", 404));
    }

    res.status(200).json({
      status: "success",
      property,
    });
  }
);

export const updateProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { propertyID } = req.params;

    if (req.body.id || req.body._id) {
      return next(new GlobalError("property ID cannot be modified", 404));
    }

    //@ts-ignore
    const property = await Property.findByIdAndUpdate(propertyID, req.body, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return next(new GlobalError("Property not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      property,
    });
  }
);

export const deleteProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { propertyID } = req.params;

    if (req.body.id || req.body._id) {
      return next(new GlobalError("property ID cannot be modified", 404));
    }

    const property = await Property.findById(propertyID);

    if (!property) {
      return next(new GlobalError("Property not found", 404));
    }

    //@ts-ignore
    if (property.addedBy !== req.user._id && req.user.role !== "admin") {
      return next(
        new GlobalError("You can only delete properties you added", 401)
      );
    }

    await Property.findByIdAndDelete(propertyID);

    res.status(200).json({
      status: "success",
      message: "Property deleted successfully",
    });
  }
);

export const getPropertyReviews = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { propertyID } = req.params;

    const review = Review.findById(propertyID);

    res.status(200).json({
      status: "success",
      message: "Property deleted successfully",
    });
  }
);

export const uplodaProperyPhotos = upload.array("images", 6);
