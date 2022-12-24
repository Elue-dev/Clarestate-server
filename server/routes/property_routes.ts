import { Router } from "express";
import {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  uplodaProperyPhotos,
} from "../controllers/property_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router
  .route("/")
  .get(requireAuth, restrictTo("admin"), getAllProperties)
  .post(requireAuth, uplodaProperyPhotos, createProperty);

router
  .route("/:slug")
  .get(requireAuth, getSingleProperty)
  .patch(requireAuth, restrictTo("admin"), updateProperty);

export default router;
