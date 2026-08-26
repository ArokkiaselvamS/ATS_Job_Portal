"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.getAuditLogs = getAuditLogs;
const prisma_1 = __importDefault(require("../utils/prisma"));
async function createAuditLog(params) {
    return prisma_1.default.auditLog.create({
        data: {
            adminId: params.adminId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            oldValue: params.oldValue ?? undefined,
            newValue: params.newValue ?? undefined,
            ipAddress: params.ipAddress,
        },
    });
}
async function getAuditLogs(params) {
    const { page = 1, limit = 20, adminId, action, entityType, startDate, endDate } = params;
    const skip = (page - 1) * limit;
    const where = {};
    if (adminId)
        where.adminId = adminId;
    if (action)
        where.action = { contains: action, mode: 'insensitive' };
    if (entityType)
        where.entityType = entityType;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate)
            where.createdAt.gte = startDate;
        if (endDate)
            where.createdAt.lte = endDate;
    }
    const [logs, total] = await Promise.all([
        prisma_1.default.auditLog.findMany({
            where,
            include: { admin: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.default.auditLog.count({ where }),
    ]);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
