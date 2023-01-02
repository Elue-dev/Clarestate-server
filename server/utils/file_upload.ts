import multer from "multer";
import { Request } from "express";
import { GlobalError } from "./global_error";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "dist/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new GlobalError("Not an image, Please upload only images", 400), false);
  }
};

export const upload = multer({ storage, fileFilter });

export const fileSizeFormatter = (bytes: number, decimal: number) => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const dm = decimal || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1000));
  return (
    parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]
  );
};
