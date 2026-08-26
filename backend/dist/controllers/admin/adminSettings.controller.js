"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const getSettings = async (req, res, next) => {
    try {
        const settings = await prisma_1.default.platformSetting.findMany({ orderBy: { key: 'asc' } });
        const grouped = {};
        for (const s of settings) {
            if (!grouped[s.category])
                grouped[s.category] = [];
            grouped[s.category].push({ key: s.key, value: s.value, updatedAt: s.updatedAt });
        }
        res.json({ success: true, data: grouped });
    }
    catch (error) {
        next(error);
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res, next) => {
    try {
        const { settings } = req.body;
        for (const { key, value, category } of settings) {
            await prisma_1.default.platformSetting.upsert({
                where: { key },
                update: { value, category },
                create: { key, value, category },
            });
        }
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'SETTINGS_UPDATED', entityType: 'PlatformSetting', newValue: { settings } });
        res.json({ success: true, message: 'Settings updated' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSettings = updateSettings;
