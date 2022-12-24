"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comments_controller_1 = require("../controllers/comments_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(auth_middleware_1.requireAuth, (0, auth_middleware_1.restrictTo)("admin"), comments_controller_1.gettAllComments)
    .post(auth_middleware_1.requireAuth, comments_controller_1.createComment);
exports.default = router;
