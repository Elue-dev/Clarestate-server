"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("../controllers/property_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), property_controller_1.getAllProperties)
    .post(auth_middleware_1.requireAuth, property_controller_1.uplodaProperyPhotos, property_controller_1.createProperty);
router.get("/:slug", auth_middleware_1.requireAuth, property_controller_1.getSingleProperty);
router
    .route("/:propertyID")
    .patch(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), property_controller_1.updateProperty)
    .delete(auth_middleware_1.requireAuth, property_controller_1.deleteProperty);
exports.default = router;
