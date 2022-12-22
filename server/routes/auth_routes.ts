import { Router } from "express";

import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  updatePassword,
} from "../controllers/auth_controller";
import { requireAuth } from "../middlewares/auth_middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/update-password", requireAuth, updatePassword);

export default router;
