"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSkills = exports.updateSkill = exports.createSkill = exports.getSkills = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const getSkills = async (req, res, next) => {
    try {
        const { page = '1', limit = '50', search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        const [skills, total] = await Promise.all([
            prisma_1.default.skill.findMany({
                where,
                include: { category: { select: { id: true, name: true } }, _count: { select: { aliases: true } } },
                orderBy: { name: 'asc' },
                skip, take: limitNum,
            }),
            prisma_1.default.skill.count({ where }),
        ]);
        res.json({ success: true, data: { skills, total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        next(error);
    }
};
exports.getSkills = getSkills;
const createSkill = async (req, res, next) => {
    try {
        const { name, categoryId } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const skill = await prisma_1.default.skill.create({
            data: { name, slug, categoryId: categoryId || undefined },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'SKILL_CREATED', entityType: 'Skill', entityId: skill.id, newValue: { name } });
        res.status(201).json({ success: true, data: skill });
    }
    catch (error) {
        next(error);
    }
};
exports.createSkill = createSkill;
const updateSkill = async (req, res, next) => {
    try {
        const { name, categoryId, isActive, canonicalId } = req.body;
        const data = {};
        if (name !== undefined) {
            data.name = name;
            data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        if (categoryId !== undefined)
            data.categoryId = categoryId;
        if (isActive !== undefined)
            data.isActive = isActive;
        if (canonicalId !== undefined)
            data.canonicalId = canonicalId;
        const skill = await prisma_1.default.skill.update({ where: { id: parseInt(String(req.params.id)) }, data });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'SKILL_UPDATED', entityType: 'Skill', entityId: skill.id, newValue: data });
        res.json({ success: true, data: skill });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSkill = updateSkill;
const mergeSkills = async (req, res, next) => {
    try {
        const { targetSkillId, sourceSkillIds } = req.body;
        const target = await prisma_1.default.skill.findUnique({ where: { id: targetSkillId } });
        if (!target) {
            res.status(404).json({ success: false, message: 'Target skill not found' });
            return;
        }
        await prisma_1.default.skill.updateMany({ where: { id: { in: sourceSkillIds } }, data: { canonicalId: targetSkillId } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'SKILLS_MERGED', entityType: 'Skill', entityId: targetSkillId, newValue: { mergedFrom: sourceSkillIds } });
        res.json({ success: true, message: 'Skills merged' });
    }
    catch (error) {
        next(error);
    }
};
exports.mergeSkills = mergeSkills;
