"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = void 0;
const audit_service_1 = require("../../services/audit.service");
const listAuditLogs = async (req, res, next) => {
    try {
        const { page, limit, adminId, action, entityType, startDate, endDate } = req.query;
        const result = await (0, audit_service_1.getAuditLogs)({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            adminId: adminId ? parseInt(adminId) : undefined,
            action: action,
            entityType: entityType,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.listAuditLogs = listAuditLogs;
