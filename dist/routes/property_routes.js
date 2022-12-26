"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("../controllers/property_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const review_routes_1 = __importDefault(require("../routes/review_routes"));
const comment_routes_1 = __importDefault(require("../routes/comment_routes"));
const router = (0, express_1.Router)();
router.use("/:propertyID/reviews", review_routes_1.default);
router.use("/:propertyID/comments", comment_routes_1.default);
router.use(auth_middleware_1.requireAuth);
router
    .route("/")
    .get(property_controller_1.getAllProperties)
    .post(property_controller_1.uplodaProperyPhotos, property_controller_1.createProperty);
router.get("/:slug", property_controller_1.getSingleProperty);
router
    .route("/:propertyID")
    .patch((0, auth_middleware_1.restrictTo)("admin"), property_controller_1.updateProperty)
    .delete(property_controller_1.deleteProperty);
exports.default = router;
