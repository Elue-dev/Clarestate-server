import { Request, Response, NextFunction } from "express";
import Property from "../models/schemas/property_model";
import handleAsync from "../utils/handle_async";
import cloudinary from "cloudinary";
import { fileSizeFormatter, upload } from "../utils/file_upload";
import { GlobalError } from "../utils/global_error";
import { APIFeatures } from "../services/api_features";

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

    res.status(200).json({
      status: "success",
      property,
    });
  }
);

export const getAllProperties = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .sort()
      .limitFields();

    //@ts-ignore
    const properties = await features.query;

    res.status(200).json({
      status: "success",
      results: properties.length,
      properties,
    });
  }
);

export const uplodaProperyPhotos = upload.array("images", 6);
