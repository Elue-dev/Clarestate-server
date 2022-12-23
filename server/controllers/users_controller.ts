import { Request, Response, NextFunction } from "express";
import User from "../models/schemas/user_model";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";

export const getAllUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().sort("-createdAt");

    console.log("start");

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  }
);

export const getSingleUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;

    const user = await User.findById(userID);

    if (!user) {
      return next(new GlobalError("No user with that id exists", 404));
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);

export const updateUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;

    const user = await User.findById(userID);

    const { role } = req.body;

    if (!user) {
      return next(new GlobalError("No user with that id exists", 404));
    }

    const filteredBody = filteredObj(
      req.body,
      "username",
      "email",
      "photo",
      "bio",
      "phone"
    );

    const updatedUser = await User.findByIdAndUpdate(userID, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  }
);

//@ts-ignore
const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((val) => {
    if (allowedFields.includes(val)) {
      //@ts-ignore
      newObj[val] = obj[val];
    }
  });
  return newObj;
};
