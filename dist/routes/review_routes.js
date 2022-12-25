"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("../controllers/reviews_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.route("/").get((0, auth_middleware_1.restrictTo)("admin"), reviews_controller_1.getAllReviews).post(reviews_controller_1.createReview);
router
    .route("/:reviewID")
    .get(reviews_controller_1.getSingleReview)
    .patch(reviews_controller_1.updateReview)
    .delete(reviews_controller_1.deleteReview);
exports.default = router;
