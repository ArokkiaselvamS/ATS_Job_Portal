"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../../middleware/adminAuth");
const adminAuditLogs_controller_1 = require("../../controllers/admin/adminAuditLogs.controller");
const router = (0, express_1.Router)();
router.use(adminAuth_1.requireAuth, adminAuth_1.requireSuperAdmin);
router.get('/', adminAuditLogs_controller_1.listAuditLogs);
exports.default = router;
