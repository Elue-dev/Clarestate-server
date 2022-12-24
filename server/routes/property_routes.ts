import { Router } from "express";
import {
  createProperty,
  getAllProperties,
  uplodaProperyPhotos,
} from "../controllers/property_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router
  .route("/")
  .get(requireAuth, restrictTo("admin"), getAllProperties)
  .post(requireAuth, uplodaProperyPhotos, createProperty);

export default router;
