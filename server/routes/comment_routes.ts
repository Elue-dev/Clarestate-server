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

router.use(requireAuth);

router.route("/").get(restrictTo("admin"), getAllComments).post(createComment);

router
  .route("/:commentID")
  .get(getSingleComment)
  .patch(updateComment)
  .delete(deleteComment);

export default router;
