import { Router } from "express";
import { contactUs } from "../controllers/contact_controller";
import { requireAuth } from "../middlewares/auth_middleware";

const router = Router();

router.post("/", requireAuth, contactUs);

export default router;
