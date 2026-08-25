"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplications = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getApplications = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, status, jobId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status)
            where.status = status;
        if (jobId)
            where.jobId = parseInt(jobId);
        if (search) {
            where.OR = [
                { user: { firstName: { contains: search, mode: 'insensitive' } } },
                { user: { lastName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { job: { title: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [applications, total] = await Promise.all([
            prisma_1.default.application.findMany({
                where,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                    job: { select: { id: true, title: true, company: { select: { name: true } } } },
                },
                orderBy: { appliedAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.application.count({ where }),
        ]);
        res.json({ success: true, data: { applications, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getApplications = getApplications;
