import { Request, Response, NextFunction } from "express";
import User from "../models/schemas/user_model";
import sendEmail from "../services/email_service";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";
import { deleteAccount } from "../views/delete_account";

export const getAllUsers = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().sort("-createdAt");

    console.log("start");

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
    const { isVerified } = req.body;

    const user = await User.findById(userID);

    if (!user) {
      return next(new GlobalError("No user with that id exists", 404));
    }

    if (isVerified) {
      return next(
        new GlobalError(
          "You are not allowed to change user verification status",
          401
        )
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userID, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  }
);

export const updateLoggedInUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user._id);

    const { username, email, bio, photo, phone } = req.body;

    if (!user) {
      return next(new GlobalError("User not found", 404));
    }

    if (!username && !email && !bio && !phone && !photo) {
      return next(
        new GlobalError("Please provide fields you want to update", 400)
      );
    }

    if (req.body.password) {
      return next(
        new GlobalError(
          "This route is not for password updates. Please use the forgot password route",
          400
        )
      );
    }

    const filteredBody = filteredObj(
      req.body,
      "username",
      "email",
      "photo",
      "bio",
      "phone"
    );

    const updatedUser = await User.findByIdAndUpdate(
      //@ts-ignore
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  }
);

export const getLoggedInUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user._id).select("+active");

    if (!user) {
      return next(new GlobalError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export const deleteLoggedInUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.user._id).select("+active");

    if (!user) {
      return next(new GlobalError("User not found", 404));
    }

    if (!user.active) {
      return next(new GlobalError("User already deleted", 404));
    }

    user.active = false;

    await user.save();

    const subject = `Notification on deleted account`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = deleteAccount(user.username);

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: "User sucessfully deleted",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

export const deleteUser = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;

    const user = await User.findById(userID).select("+active");

    if (!user) {
      return next(new GlobalError("No user with that id exists", 404));
    }

    if (!user.active) {
      return next(new GlobalError("User already deleted", 404));
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
