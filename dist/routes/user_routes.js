"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get("/get-me", users_controller_1.getLoggedInUser);
router.delete("/delete-me", users_controller_1.deleteLoggedInUser);
router.route("/").get((0, auth_middleware_1.restrictTo)("admin"), users_controller_1.getAllUsers);
router
    .route("/:userID")
    .get(users_controller_1.getSingleUser)
    .patch(users_controller_1.updateUser)
    .delete(users_controller_1.deleteUser);
exports.default = router;
