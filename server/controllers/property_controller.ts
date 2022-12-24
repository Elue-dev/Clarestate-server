import { Request, Response, NextFunction } from "express";
import Property from "../models/schemas/property_model";
import handleAsync from "../utils/handle_async";
import cloudinary from "cloudinary";
import { fileSizeFormatter, upload } from "../utils/file_upload";
import { GlobalError } from "../utils/global_error";

const cloud = cloudinary.v2;

export const createProperty = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    cloud.config({
      cloud_name: process.env.CLOUD_NAME as string,
      api_key: process.env.CLOUDINARY_KEY as string,
      api_secret: process.env.CLOUDINARY_SECRET as string,
    });

    // let file_data = {};
    let uploadedFiles: any = [];

    req.body.images = [];

    console.log("running");

    await Promise.all(
      // @ts-ignore
      req.files.map(async (file: any) => {
        console.log("running.....");
        uploadedFiles = await cloud.uploader.upload(file.path, {
          folder: "Clarestate",
          resource_type: "image",
        });

        let imagesArray: any = [];

        // await imagesArray.push(uploadedFiles.secure_url);
        // console.log(imagesArray);

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
    const properties = await Property.find().sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: properties.length,
      properties,
    });
  }
);

export const uplodaProperyPhotos = upload.array("images", 6);
