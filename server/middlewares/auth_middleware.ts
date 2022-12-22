import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";
import User from "../models/database/user_model";
import { UserPayload } from "../models/types/auth_types";

export const requireAuth = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const headers = req.headers.authorization;

    if (headers && headers.startsWith("Bearer")) {
      token = headers.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new GlobalError(
          "You are not logged in. Please log in to get access",
          401
        )
      );
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;

    const freshUser = await User.findById(payload.id).select("-password");

    if (!freshUser) {
      return next(new GlobalError("Session expired. Please Log in again", 401));
    }

    //@ts-ignore
    req.user = freshUser;

    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    if (!roles.includes(req.user.role)) {
      return next(
        new GlobalError(
          "Unauthorized. Only admins can perform this action.",
          401
        )
      );
    }
  };
};
