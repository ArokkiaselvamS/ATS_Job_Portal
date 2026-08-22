"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobById = exports.getJobs = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getJobs = async (req, res, next) => {
    try {
        const jobs = await prisma_1.default.job.findMany({
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: jobs });
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
            include: { company: true }
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
