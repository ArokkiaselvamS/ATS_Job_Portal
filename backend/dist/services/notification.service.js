"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getNotifications = getNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
const prisma_1 = __importDefault(require("../utils/prisma"));
async function createNotification(params) {
    return prisma_1.default.notification.create({
        data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            entityType: params.entityType,
            entityId: params.entityId,
        },
    });
}
async function getNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
        prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.default.notification.count({ where: { userId } }),
        prisma_1.default.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
}
async function markAsRead(notificationId, userId) {
    return prisma_1.default.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
    });
}
async function markAllAsRead(userId) {
    return prisma_1.default.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}
