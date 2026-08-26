"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../../middleware/adminAuth");
const adminApplications_controller_1 = require("../../controllers/admin/adminApplications.controller");
const router = (0, express_1.Router)();
router.use(adminAuth_1.requireAuth, adminAuth_1.requireSuperAdmin);
router.get('/', adminApplications_controller_1.getApplications);
exports.default = router;
