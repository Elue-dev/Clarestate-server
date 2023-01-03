import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  uploadProperyPhotos,
} from "../controllers/property_controller";
import { requireAuth, restrictTo } from "../middlewares/auth_middleware";
import reviewRouter from "../routes/review_routes";
import commentRouter from "../routes/comment_routes";

const router = Router();

router.use("/:propertyID/reviews", reviewRouter);
router.use("/:propertyID/comments", commentRouter);

router
  .route("/")
  .get(getAllProperties)
  .post(requireAuth, uploadProperyPhotos, createProperty);

router.get("/:slug", getSingleProperty);

router.use(requireAuth);

router.route("/:propertyID").patch(updateProperty).delete(deleteProperty);

export default router;
