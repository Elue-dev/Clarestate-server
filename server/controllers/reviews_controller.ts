import { Request, Response, NextFunction } from "express";
import handleAsync from "../utils/handle_async";
import { GlobalError } from "../utils/global_error";
import Review from "../models/schemas/reviews_model";

export const createReview = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { review, rating, user, property } = req.body;

    if (!review || !rating || !user || !property) {
      return next(new GlobalError("Please provide all required fields", 400));
    }

    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Review successfully added",
      review: newReview,
    });
  }
);

export const getAllReviews = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await Review.find().sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: reviews.length,
      reviews,
    });
  }
);

export const getSingleReview = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reviewID } = req.params;

    const review = await Review.findById(reviewID);

    if (!review) {
      return next(new GlobalError("Review not found", 400));
    }

    res.status(200).json({
      status: "success",
      review,
    });
  }
);

export const updateReview = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reviewID } = req.params;

    const review = await Review.findById(reviewID);

    if (!review) {
      return next(new GlobalError("Review not found", 404));
    }

    if (
      //@ts-ignore
      req.user._id.toString() !== review.user.toString()
    ) {
      return next(
        new GlobalError("You can only update reviews you added", 401)
      );
    }

    if (req.body.user || req.body.property || req.body.id || req.body._id) {
      return next(
        new GlobalError("Only review and rating can be changed", 400)
      );
    }

    const updatedReview = await Review.findByIdAndUpdate(reviewID, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Review updated successfully",
      updatedReview,
    });
  }
);

export const deleteReview = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reviewID } = req.params;

    const review = await Review.findById(reviewID);

    if (!review) {
      return next(new GlobalError("Review not found", 404));
    }

    if (
      //@ts-ignore
      req.user._id.toString() !== review.user.toString()
    ) {
      return next(
        new GlobalError("You can only delete reviews you added", 401)
      );
    }

    await Review.findByIdAndDelete(reviewID);

    res.status(200).json({
      status: "success",
      message: "Review deleted successfully",
    });
  }
);
