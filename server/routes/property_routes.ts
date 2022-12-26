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
import reviewRouter from "../routes/review_routes";
import commentRouter from "../routes/comment_routes";

const router = Router();

router.use("/:propertyID/reviews", reviewRouter);
router.use("/:propertyID/comments", commentRouter);

router.use(requireAuth);

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
