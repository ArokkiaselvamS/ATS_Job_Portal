"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            include: { _count: { select: { jobs: true, skills: true } } },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const category = await prisma_1.default.category.create({ data: { name, slug, description } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'CATEGORY_CREATED', entityType: 'Category', entityId: category.id, newValue: { name } });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, isActive } = req.body;
        const data = {};
        if (name !== undefined) {
            data.name = name;
            data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        if (description !== undefined)
            data.description = description;
        if (isActive !== undefined)
            data.isActive = isActive;
        const category = await prisma_1.default.category.update({ where: { id: parseInt(String(req.params.id)) }, data });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'CATEGORY_UPDATED', entityType: 'Category', entityId: category.id, newValue: data });
        res.json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
