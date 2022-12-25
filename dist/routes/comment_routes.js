"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comments_controller_1 = require("../controllers/comments_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.route("/").get((0, auth_middleware_1.restrictTo)("admin"), comments_controller_1.gettAllComments).post(comments_controller_1.createComment);
router
    .route("/:commentID")
    .get(comments_controller_1.getSingleComment)
    .patch(comments_controller_1.updateComment)
    .delete(comments_controller_1.deleteComment);
exports.default = router;
