import { Request, Response, NextFunction } from "express";
import handleAsync from "../utils/handle_async";
import { GlobalError } from "../utils/global_error";
import Comment from "../models/schemas/comments_model";
import { redisClient } from "../app";

export const createComment = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { comment, user, property } = req.body;

    if (!property) req.body.property = req.params.propertyID;
    //@ts-ignore
    if (!user) req.body.user = req.user._id;

    if (!comment) {
      return next(new GlobalError("Please add your comment", 400));
    }

    const newComment = await Comment.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Comment successfully added",
      comment: newComment,
    });
  }
);

export const getAllComments = handleAsync(
  async (req: Request, res: Response) => {
    let filter = {};
    //@ts-ignore
    if (req.params.propertyID) filter = { property: req.params.propertyID };

    const comments = await Comment.find(filter).sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: comments.length,
      comments,
    });
  }
);

export const getSingleComment = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentID } = req.params;

    const comment = await Comment.findById(commentID);

    if (!comment) {
      return next(new GlobalError("Comment not found", 404));
    }

    res.status(200).json({
      status: "success",
      comment,
    });
  }
);

export const updateComment = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentID } = req.params;

    const comment = await Comment.findById(commentID);

    if (!comment) {
      return next(new GlobalError("Comment not found", 404));
    }

    if (
      //@ts-ignore
      req.user._id.toString() !== comment.user._id.toString()
    ) {
      return next(
        new GlobalError("You can only update comments you added", 401)
      );
    }

    const newComment = await Comment.findByIdAndUpdate(commentID, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
      newComment,
    });
  }
);

export const deleteComment = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentID } = req.params;

    const comment = await Comment.findById(commentID);

    if (!comment) {
      return next(new GlobalError("Comment not found", 404));
    }

    if (
      //@ts-ignore
      req.user._id.toString() !== comment.user._id.toString()
    ) {
      return next(
        new GlobalError("You can only delete comments you added", 401)
      );
    }

    await Comment.findByIdAndDelete(commentID);

    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  }
);
