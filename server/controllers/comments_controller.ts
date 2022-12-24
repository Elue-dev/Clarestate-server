import { Request, Response, NextFunction } from "express";
import handleAsync from "../utils/handle_async";
import { GlobalError } from "../utils/global_error";
import Comment from "../models/schemas/comments_model";

export const createComment = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newReview = await Comment.create(req.body);

    // res.status(201).json({
    //   status: "success",
    //   review: newReview,
    // });
  }
);

export const gettAllComments = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newReview = await Comment.create(req.body);

    // res.status(201).json({
    //   status: "success",
    //   review: newReview,
    // });
  }
);
