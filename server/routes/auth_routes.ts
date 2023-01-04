import { Router } from "express";

import {
  emergencyResetPassword,
  forgotPassword,
  login,
  logout,
  resetPassword,
  sendVerificationCode,
  signup,
  updatePassword,
  verifyCode,
} from "../controllers/auth_controller";
import { requireAuth } from "../middlewares/auth_middleware";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email/:userID", verifyCode);
router.post("/send-verification-code", sendVerificationCode);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/update-password", requireAuth, updatePassword);
router.put("/emergency-password-reset/:userID", emergencyResetPassword);

export default router;
