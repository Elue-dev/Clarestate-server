"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router.route("/").get(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), users_controller_1.getAllUsers);
router
    .route("/:userID")
    .get(auth_middleware_1.requireAuth, users_controller_1.getSingleUser)
    .patch(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), users_controller_1.updateUser)
    .delete(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), users_controller_1.deleteUser);
exports.default = router;
