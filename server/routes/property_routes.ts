import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  uplodaProperyPhotos,
} from "../controllers/property_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";

const router = Router();

router.use(requireAuth);

// router.get("/:propertyID/reviews", getPropertyReviews);

router
  .route("/")
  .get(getAllProperties)
  .post(uplodaProperyPhotos, createProperty);

router.get("/:slug", getSingleProperty);

router
  .route("/:propertyID")
  .patch(restrictTo("admin"), updateProperty)
  .delete(deleteProperty);

export default router;
