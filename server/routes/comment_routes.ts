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

router.use(requireAuth);

router.route("/").get(restrictTo("admin"), gettAllComments).post(createComment);

router
  .route("/:commentID")
  .get(getSingleComment)
  .patch(updateComment)
  .delete(deleteComment);

export default router;
