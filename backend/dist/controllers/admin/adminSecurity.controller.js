"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurity = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getSecurity = async (req, res, next) => {
    try {
        const failedLogins = await prisma_1.default.user.findMany({
            where: { lastLoginAt: { not: null } },
            select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true, role: true },
            orderBy: { lastLoginAt: 'desc' },
            take: 50,
        });
        const suspendedUsers = await prisma_1.default.user.findMany({
            where: { isSuspended: true },
            select: { id: true, firstName: true, lastName: true, email: true, suspendedAt: true, suspensionReason: true, role: true },
            orderBy: { suspendedAt: 'desc' },
        });
        const blockedUsers = await prisma_1.default.user.findMany({
            where: { isBlocked: true },
            select: { id: true, firstName: true, lastName: true, email: true, blockedAt: true, role: true },
            orderBy: { blockedAt: 'desc' },
        });
        const recentAuditLogs = await prisma_1.default.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { firstName: true, lastName: true } } },
        });
        const suspiciousCompanies = await prisma_1.default.company.findMany({
            where: { verificationStatus: 'PENDING', createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            select: { id: true, name: true, createdAt: true, verificationStatus: true },
        });
        res.json({
            success: true,
            data: {
                failedLogins: failedLogins.length,
                recentLogins: failedLogins,
                suspendedUsers,
                blockedUsers,
                recentAuditLogs,
                suspiciousCompanies,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSecurity = getSecurity;
