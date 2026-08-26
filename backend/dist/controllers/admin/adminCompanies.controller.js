"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateCompany = exports.suspendCompany = exports.rejectCompany = exports.verifyCompany = exports.getCompanyById = exports.getCompanies = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const notification_service_1 = require("../../services/notification.service");
const getCompanies = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, verification, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (verification)
            where.verificationStatus = verification;
        if (status === 'suspended')
            where.isSuspended = true;
        else if (status === 'active')
            where.isSuspended = false;
        const [companies, total] = await Promise.all([
            prisma_1.default.company.findMany({
                where,
                include: {
                    _count: { select: { jobs: true, admins: true } },
                    admins: { select: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.company.count({ where }),
        ]);
        res.json({ success: true, data: { companies, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getCompanies = getCompanies;
const getCompanyById = async (req, res, next) => {
    try {
        const company = await prisma_1.default.company.findUnique({
            where: { id: parseInt(String(req.params.id)) },
            include: {
                admins: { select: { user: { select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true } } } },
                _count: { select: { jobs: true } },
                jobs: { select: { id: true, title: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        if (!company) {
            res.status(404).json({ success: false, message: 'Company not found' });
            return;
        }
        res.json({ success: true, data: company });
    }
    catch (error) {
        next(error);
    }
};
exports.getCompanyById = getCompanyById;
const verifyCompany = async (req, res, next) => {
    try {
        const company = await prisma_1.default.company.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { verificationStatus: 'VERIFIED', verifiedAt: new Date(), verifiedById: req.user.userId, rejectionReason: null },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_VERIFIED', entityType: 'Company', entityId: company.id, newValue: { status: 'VERIFIED' } });
        const admins = await prisma_1.default.companyAdmin.findMany({ where: { companyId: company.id }, select: { userId: true } });
        for (const admin of admins) {
            await (0, notification_service_1.createNotification)({
                userId: admin.userId, type: 'COMPANY_APPROVED',
                title: 'Company Verified', message: `Your company "${company.name}" has been verified.`,
                entityType: 'Company', entityId: company.id,
            });
        }
        res.json({ success: true, message: 'Company verified', data: company });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyCompany = verifyCompany;
const rejectCompany = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const company = await prisma_1.default.company.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { verificationStatus: 'REJECTED', rejectionReason: reason },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_REJECTED', entityType: 'Company', entityId: company.id, newValue: { reason } });
        const admins = await prisma_1.default.companyAdmin.findMany({ where: { companyId: company.id }, select: { userId: true } });
        for (const admin of admins) {
            await (0, notification_service_1.createNotification)({
                userId: admin.userId, type: 'COMPANY_REJECTED',
                title: 'Company Rejected', message: `Your company "${company.name}" verification was rejected. Reason: ${reason}`,
                entityType: 'Company', entityId: company.id,
            });
        }
        res.json({ success: true, message: 'Company rejected', data: company });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectCompany = rejectCompany;
const suspendCompany = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const company = await prisma_1.default.company.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isSuspended: true, suspendedAt: new Date(), suspensionReason: reason },
        });
        await prisma_1.default.job.updateMany({ where: { companyId: company.id }, data: { status: 'SUSPENDED' } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_SUSPENDED', entityType: 'Company', entityId: company.id, newValue: { reason } });
        res.json({ success: true, message: 'Company suspended' });
    }
    catch (error) {
        next(error);
    }
};
exports.suspendCompany = suspendCompany;
const activateCompany = async (req, res, next) => {
    try {
        const company = await prisma_1.default.company.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isSuspended: false, suspendedAt: null, suspensionReason: null },
        });
        await prisma_1.default.job.updateMany({ where: { companyId: company.id, status: 'SUSPENDED' }, data: { status: 'ACTIVE' } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'COMPANY_ACTIVATED', entityType: 'Company', entityId: company.id });
        res.json({ success: true, message: 'Company activated' });
    }
    catch (error) {
        next(error);
    }
};
exports.activateCompany = activateCompany;
