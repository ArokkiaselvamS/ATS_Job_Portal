"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeJob = exports.resumeJob = exports.pauseJob = exports.suspendJob = exports.rejectJob = exports.approveJob = exports.getJobById = exports.getJobs = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const notification_service_1 = require("../../services/notification.service");
const getJobs = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, status, source } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (source)
            where.source = source;
        const [jobs, total] = await Promise.all([
            prisma_1.default.job.findMany({
                where,
                include: {
                    company: { select: { id: true, name: true, logo: true } },
                    _count: { select: { applications: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.job.count({ where }),
        ]);
        res.json({ success: true, data: { jobs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res, next) => {
    try {
        const job = await prisma_1.default.job.findUnique({
            where: { id: parseInt(String(req.params.id)) },
            include: {
                company: true,
                _count: { select: { applications: true, savedJobs: true } },
                applications: { take: 10, orderBy: { appliedAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
            },
        });
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }
        res.json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobById = getJobById;
const approveJob = async (req, res, next) => {
    try {
        const job = await prisma_1.default.job.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { status: 'ACTIVE', approvedAt: new Date(), approvedById: req.user.userId, rejectionReason: null },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'JOB_APPROVED', entityType: 'Job', entityId: job.id, newValue: { status: 'ACTIVE' } });
        res.json({ success: true, message: 'Job approved' });
    }
    catch (error) {
        next(error);
    }
};
exports.approveJob = approveJob;
const rejectJob = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const job = await prisma_1.default.job.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { status: 'REJECTED', rejectionReason: reason },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'JOB_REJECTED', entityType: 'Job', entityId: job.id, newValue: { reason } });
        res.json({ success: true, message: 'Job rejected' });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectJob = rejectJob;
const suspendJob = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const job = await prisma_1.default.job.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { status: 'SUSPENDED', rejectionReason: reason },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'JOB_SUSPENDED', entityType: 'Job', entityId: job.id, newValue: { reason } });
        const companyAdmins = await prisma_1.default.companyAdmin.findMany({ where: { companyId: job.companyId }, select: { userId: true } });
        for (const admin of companyAdmins) {
            await (0, notification_service_1.createNotification)({
                userId: admin.userId, type: 'JOB_SUSPENDED',
                title: 'Job Suspended', message: `Your job "${job.title}" has been suspended. Reason: ${reason}`,
                entityType: 'Job', entityId: job.id,
            });
        }
        res.json({ success: true, message: 'Job suspended' });
    }
    catch (error) {
        next(error);
    }
};
exports.suspendJob = suspendJob;
const pauseJob = async (req, res, next) => {
    try {
        const job = await prisma_1.default.job.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'PAUSED' } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'JOB_PAUSED', entityType: 'Job', entityId: job.id });
        res.json({ success: true, message: 'Job paused' });
    }
    catch (error) {
        next(error);
    }
};
exports.pauseJob = pauseJob;
const resumeJob = async (req, res, next) => {
    try {
        const job = await prisma_1.default.job.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'ACTIVE' } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'JOB_RESUMED', entityType: 'Job', entityId: job.id });
        res.json({ success: true, message: 'Job resumed' });
    }
    catch (error) {
        next(error);
    }
};
exports.resumeJob = resumeJob;
const closeJob = async (req, res, next) => {
    try {
        const job = await prisma_1.default.job.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'CLOSED' } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'JOB_CLOSED', entityType: 'Job', entityId: job.id });
        res.json({ success: true, message: 'Job closed' });
    }
    catch (error) {
        next(error);
    }
};
exports.closeJob = closeJob;
