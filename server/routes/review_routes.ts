import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getSingleReview,
  updateReview,
} from "../controllers/reviews_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router
  .route("/")
  .get(requireAuth, restrictTo("admin"), getAllReviews)
  .post(requireAuth, createReview);

router
  .route("/:reviewID")
  .get(requireAuth, getSingleReview)
  .patch(requireAuth, updateReview)
  .delete(requireAuth, deleteReview);

export default router;
