"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockCompanyAdmin = exports.activateCompanyAdmin = exports.suspendCompanyAdmin = exports.getCompanyAdminById = exports.getCompanyAdmins = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const getCompanyAdmins = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { role: { in: ['COMPANY_ADMIN', 'EMPLOYER'] } };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status === 'suspended')
            where.isSuspended = true;
        else if (status === 'blocked')
            where.isBlocked = true;
        else if (status === 'active') {
            where.isActive = true;
            where.isSuspended = false;
            where.isBlocked = false;
        }
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                select: {
                    id: true, firstName: true, lastName: true, email: true, role: true,
                    isActive: true, isSuspended: true, isBlocked: true,
                    createdAt: true, lastLoginAt: true,
                    companies: { select: { company: { select: { id: true, name: true, verificationStatus: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.user.count({ where }),
        ]);
        res.json({ success: true, data: { users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getCompanyAdmins = getCompanyAdmins;
const getCompanyAdminById = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: parseInt(String(req.params.id)) },
            select: {
                id: true, firstName: true, lastName: true, email: true, phone: true, role: true,
                isActive: true, isSuspended: true, isBlocked: true, suspensionReason: true,
                createdAt: true, lastLoginAt: true,
                companies: { select: { company: true } },
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getCompanyAdminById = getCompanyAdminById;
const suspendCompanyAdmin = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isSuspended: true, suspendedAt: new Date(), suspensionReason: reason, isActive: false },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_ADMIN_SUSPENDED', entityType: 'User', entityId: user.id, newValue: { reason } });
        res.json({ success: true, message: 'Company admin suspended' });
    }
    catch (error) {
        next(error);
    }
};
exports.suspendCompanyAdmin = suspendCompanyAdmin;
const activateCompanyAdmin = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isActive: true, isSuspended: false, suspendedAt: null, suspensionReason: null },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_ADMIN_ACTIVATED', entityType: 'User', entityId: user.id });
        res.json({ success: true, message: 'Company admin activated' });
    }
    catch (error) {
        next(error);
    }
};
exports.activateCompanyAdmin = activateCompanyAdmin;
const blockCompanyAdmin = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isBlocked: true, blockedAt: new Date(), isActive: false },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_ADMIN_BLOCKED', entityType: 'User', entityId: user.id });
        res.json({ success: true, message: 'Company admin blocked' });
    }
    catch (error) {
        next(error);
    }
};
exports.blockCompanyAdmin = blockCompanyAdmin;
