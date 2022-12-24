"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("../controllers/reviews_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), reviews_controller_1.getAllReviews)
    .post(auth_middleware_1.requireAuth, reviews_controller_1.createReview);
router
    .route("/:reviewID")
    .get(auth_middleware_1.requireAuth, reviews_controller_1.getSingleReview)
    .patch(auth_middleware_1.requireAuth, reviews_controller_1.updateReview)
    .delete(auth_middleware_1.requireAuth, reviews_controller_1.deleteReview);
exports.default = router;
