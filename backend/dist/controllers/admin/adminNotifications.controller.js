"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.listNotifications = void 0;
const notification_service_1 = require("../../services/notification.service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const listNotifications = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page, limit } = req.query;
        const result = await (0, notification_service_1.getNotifications)(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.listNotifications = listNotifications;
const markNotificationRead = async (req, res, next) => {
    try {
        await (0, notification_service_1.markAsRead)(parseInt(String(req.params.id)), req.user.userId);
        res.json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (req, res, next) => {
    try {
        await (0, notification_service_1.markAllAsRead)(req.user.userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const sendNotification = async (req, res, next) => {
    try {
        const { userId, type, title, message } = req.body;
        const notification = await prisma_1.default.notification.create({
            data: { userId, type, title, message },
        });
        res.status(201).json({ success: true, data: notification });
    }
    catch (error) {
        next(error);
    }
};
exports.sendNotification = sendNotification;
