import { Router } from "express";
import {
  createComment,
  gettAllComments,
} from "../controllers/comments_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router
  .route("/")
  .get(requireAuth, restrictTo("admin"), gettAllComments)
  .post(requireAuth, createComment);

export default router;
