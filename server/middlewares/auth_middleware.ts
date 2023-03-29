import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";
import User from "../models/schemas/user_model";
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

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserPayload;

      const freshUser = await User.findById(payload.id).select("-password");

      if (!freshUser) {
        return next(
          new GlobalError("The user with this token no longer exists", 401)
        );
      }

      // @ts-ignore
      if (freshUser.changedPasswordAfter(payload.iat)) {
        return next(
          new GlobalError(
            "User recently changed password, Please log in again",
            401
          )
        );
      }
      //@ts-ignore
      req.user = freshUser;
    } catch (err) {
      return next(new GlobalError("Session expired. Please log in again", 401));
    }

    next();
  }
);

export const restrictTo = (...roles: any) => {
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

    next();
  };
};
