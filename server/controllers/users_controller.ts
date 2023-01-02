import { Request, Response, NextFunction } from "express";
import Property from "../models/schemas/property_model";
import User from "../models/schemas/user_model";
import sendEmail from "../services/email_service";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";

export const getAllUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({ active: { $ne: false } })
      .sort("-createdAt")
      .select("+active");

    res.status(200).json({
      status: "success",
      results: users.length,
      users,
    });
  }
);

export const getSingleUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;

    const user = await User.findOne({
      _id: userID,
      active: { $ne: false },
    });

    if (!user) {
      return next(new GlobalError("No user found", 404));
    }

    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export const getUserProperties = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const properties = await Property.find({ addedBy: req.user._id });

    if (!properties) {
      return next(
        new GlobalError("You have not added any properties yet", 404)
      );
    }

    res.status(200).json({
      status: "success",
      properties,
    });
  }
);

export const updateUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;
    const { first_name, last_name, photo, email, isVerified } = req.body;

    const user = await User.findOne({
      _id: userID,
      active: { $ne: false },
    });

    if (!user) {
      return next(new GlobalError("No user found", 404));
    }

    if (first_name === "" || last_name === "" || photo === "") {
      return next(
        new GlobalError("First name, last name and photo are all required", 401)
      );
    }

    if (isVerified) {
      return next(
        new GlobalError(
          "You are not allowed to change user verification status",
          401
        )
      );
    }

    if (
      //@ts-ignore
      req.user._id.toString() !== userID &&
      //@ts-ignore
      req.user.role !== "admin"
    ) {
      return next(new GlobalError("You can only update your own account", 401));
    }

    if (req.body.password) {
      return next(
        new GlobalError(
          "This route is not for password updates. Please use the forgot password route",
          400
        )
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userID, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      updatedUser,
    });
  }
);

export const getLoggedInUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user._id).select("+active");

    if (!user || !user.active) {
      return next(new GlobalError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export const deleteUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;

    const user = await User.findOne({
      _id: userID,
      active: { $ne: false },
    });

    if (!user) {
      return next(new GlobalError("No user found", 404));
    }

    if (
      //@ts-ignore
      req.user._id.toString() !== userID &&
      //@ts-ignore
      req.user.role !== "admin"
    ) {
      return next(new GlobalError("You can only delete your own account", 401));
    }

    user.active = false;

    await user.save();
    res.status(200).json({
      status: "success",
      message: "User sucessfully deleted",
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
