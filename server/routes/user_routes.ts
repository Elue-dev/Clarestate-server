import { Router } from "express";
import {
  getSingleUser,
  getAllUsers,
  updateUser,
  deleteUser,
  updateLoggedInUser,
  getLoggedInUser,
  deleteLoggedInUser,
} from "../controllers/users_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router.patch("/update-me", requireAuth, updateLoggedInUser);
router.get("/get-me", requireAuth, getLoggedInUser);
router.delete("/delete-me", requireAuth, deleteLoggedInUser);

router.route("/").get(requireAuth, restrictTo("admin"), getAllUsers);

router
  .route("/:userID")
  .get(requireAuth, getSingleUser)
  .patch(requireAuth, restrictTo("admin"), updateUser)
  .delete(requireAuth, restrictTo("admin"), deleteUser);

export default router;
