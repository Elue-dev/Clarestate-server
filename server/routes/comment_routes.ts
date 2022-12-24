import { Router } from "express";
import {
  createComment,
  deleteComment,
  getSingleComment,
  gettAllComments,
  updateComment,
} from "../controllers/comments_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router
  .route("/")
  .get(requireAuth, restrictTo("admin"), gettAllComments)
  .post(requireAuth, createComment);

router
  .route("/:commentID")
  .get(requireAuth, getSingleComment)
  .patch(requireAuth, updateComment)
  .delete(requireAuth, deleteComment);

export default router;
