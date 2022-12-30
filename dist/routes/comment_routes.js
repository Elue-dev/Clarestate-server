"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comments_controller_1 = require("../controllers/comments_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.route("/").get(comments_controller_1.getAllComments).post(auth_middleware_1.requireAuth, comments_controller_1.createComment);
router
    .route("/:commentID")
    .get(comments_controller_1.getSingleComment)
    .patch(auth_middleware_1.requireAuth, comments_controller_1.updateComment)
    .delete(auth_middleware_1.requireAuth, comments_controller_1.deleteComment);
exports.default = router;
