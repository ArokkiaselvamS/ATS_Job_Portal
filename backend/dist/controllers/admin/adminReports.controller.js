"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReport = exports.getReports = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const getReports = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', status, targetType } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status)
            where.status = status;
        if (targetType)
            where.targetType = targetType;
        const [reports, total] = await Promise.all([
            prisma_1.default.platformReport.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.platformReport.count({ where }),
        ]);
        res.json({ success: true, data: { reports, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getReports = getReports;
const updateReport = async (req, res, next) => {
    try {
        const { status, resolution } = req.body;
        const report = await prisma_1.default.platformReport.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { status, resolution, reviewedById: req.user.userId, reviewedAt: new Date() },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'REPORT_UPDATED', entityType: 'Report', entityId: report.id, newValue: { status, resolution } });
        res.json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReport = updateReport;
