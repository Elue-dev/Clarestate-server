"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact_controller");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.requireAuth, contact_controller_1.contactUs);
exports.default = router;
