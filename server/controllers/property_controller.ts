import { Request, Response, NextFunction } from "express";
import Property from "../models/schemas/property_model";
import handleAsync from "../utils/handle_async";
import cloudinary from "cloudinary";
import { upload } from "../utils/file_upload";
import { GlobalError } from "../utils/global_error";
import { APIFeatures } from "../services/api_features";
import fs from "fs";
import { promisify } from "util";

const cloud = cloudinary.v2;

const unlinkAsync = promisify(fs.unlink);

export const createProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    cloud.config({
      cloud_name: process.env.CLOUD_NAME as string,
      api_key: process.env.CLOUDINARY_KEY as string,
      api_secret: process.env.CLOUDINARY_SECRET as string,
    });

    //@ts-ignore
    req.body.addedBy = req.user._id;

    let uploadedFiles: any = [];

    req.body.images = [];

    await Promise.all(
      // @ts-ignore
      req.files.map(async (file: any) => {
        uploadedFiles = await cloud.uploader.upload(file.path, {
          folder: "Clarestate",
          resource_type: "image",
        });
        await unlinkAsync(file.path);

        await req.body.images.push(uploadedFiles.secure_url);
      })
    );

    const property = await Property.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Property added successfully",
      property,
    });
  }
);

export const getAllProperties = handleAsync(
  async (req: Request, res: Response) => {
    //@ts-ignore
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .sort()
      .limitFields();

    const properties = await features.query;

    res.status(200).json({
      status: "success",
      results: properties.length,
      properties,
    });
  }
);

export const getSingleProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    const property = await Property.findOne({ slug })
      .populate("reviews")
      .populate("comments");

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

    console.log(req.body);

    if (req.body.id || req.body._id) {
      return next(new GlobalError("property ID cannot be modified", 404));
    }

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

export const uploadProperyPhotos = upload.array("images", 6);
