"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockJobSeeker = exports.activateJobSeeker = exports.suspendJobSeeker = exports.getJobSeekerById = exports.getJobSeekers = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const getJobSeekers = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { role: 'JOB_SEEKER' };
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
                    id: true, firstName: true, lastName: true, email: true, phone: true,
                    isActive: true, isSuspended: true, isBlocked: true,
                    createdAt: true, lastLoginAt: true, profileImage: true,
                    profile: { select: { location: true, headline: true } },
                    _count: { select: { applications: true } },
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
exports.getJobSeekers = getJobSeekers;
const getJobSeekerById = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: parseInt(String(req.params.id)) },
            select: {
                id: true, firstName: true, lastName: true, email: true, phone: true, role: true,
                isActive: true, isSuspended: true, isBlocked: true, suspensionReason: true,
                createdAt: true, lastLoginAt: true, profileImage: true,
                profile: true,
                _count: { select: { applications: true, savedJobs: true } },
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
exports.getJobSeekerById = getJobSeekerById;
const suspendJobSeeker = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isSuspended: true, suspendedAt: new Date(), suspensionReason: reason, isActive: false },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'USER_SUSPENDED', entityType: 'User', entityId: user.id, newValue: { reason } });
        res.json({ success: true, message: 'User suspended' });
    }
    catch (error) {
        next(error);
    }
};
exports.suspendJobSeeker = suspendJobSeeker;
const activateJobSeeker = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isActive: true, isSuspended: false, suspendedAt: null, suspensionReason: null },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'USER_ACTIVATED', entityType: 'User', entityId: user.id });
        res.json({ success: true, message: 'User activated' });
    }
    catch (error) {
        next(error);
    }
};
exports.activateJobSeeker = activateJobSeeker;
const blockJobSeeker = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isBlocked: true, blockedAt: new Date(), isActive: false },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'USER_BLOCKED', entityType: 'User', entityId: user.id, newValue: { reason } });
        res.json({ success: true, message: 'User blocked' });
    }
    catch (error) {
        next(error);
    }
};
exports.blockJobSeeker = blockJobSeeker;
