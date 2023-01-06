import { Router } from "express";
import { contactMe, contactUs } from "../controllers/contact_controller";
import { requireAuth } from "../middlewares/auth_middleware";

const router = Router();

router.post("/", requireAuth, contactUs);
router.post("/contact-me", contactMe);

export default router;
