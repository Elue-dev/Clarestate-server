import { Router } from "express";
import {
  createComment,
  deleteComment,
  getSingleComment,
  getAllComments,
  updateComment,
} from "../controllers/comments_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router({ mergeParams: true });

router.route("/").get(getAllComments).post(requireAuth, createComment);

router
  .route("/:commentID")
  .get(getSingleComment)
  .patch(requireAuth, updateComment)
  .delete(requireAuth, deleteComment);

export default router;
