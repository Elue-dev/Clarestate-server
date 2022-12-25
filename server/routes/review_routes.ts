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

router.use(requireAuth);

router.route("/").get(restrictTo("admin"), getAllReviews).post(createReview);

router
  .route("/:reviewID")
  .get(getSingleReview)
  .patch(updateReview)
  .delete(deleteReview);

export default router;
