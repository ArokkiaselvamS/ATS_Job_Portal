"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../../middleware/adminAuth");
const adminAnalytics_controller_1 = require("../../controllers/admin/adminAnalytics.controller");
const router = (0, express_1.Router)();
router.use(adminAuth_1.requireAuth, adminAuth_1.requireSuperAdmin);
router.get('/', adminAnalytics_controller_1.getAnalytics);
exports.default = router;
