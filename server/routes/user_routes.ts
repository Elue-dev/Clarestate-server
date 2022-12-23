import { Router } from "express";
import {
  getSingleUser,
  getAllUsers,
  updateUser,
} from "../controllers/users_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router.route("/").get(requireAuth, restrictTo("admin"), getAllUsers);

router
  .route("/:userID")
  .get(requireAuth, getSingleUser)
  .patch(requireAuth, restrictTo("admin"), updateUser);

export default router;
