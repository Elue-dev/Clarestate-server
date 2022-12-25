import { Router } from "express";
import {
  getSingleUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getLoggedInUser,
  deleteLoggedInUser,
} from "../controllers/users_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router.use(requireAuth);

router.get("/get-me", getLoggedInUser);
router.delete("/delete-me", deleteLoggedInUser);

router.route("/").get(restrictTo("admin"), getAllUsers);

router
  .route("/:userID")
  .get(getSingleUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
