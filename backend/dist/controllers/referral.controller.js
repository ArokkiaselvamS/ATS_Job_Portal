"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordReferralShare = exports.getReferralStats = exports.getInvitations = exports.sendInvitations = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
const sendInvitationsSchema = zod_1.z.object({
    emails: zod_1.z.array(zod_1.z.string().email()).min(1, 'At least one email is required'),
});
const sendInvitations = async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const data = sendInvitationsSchema.parse(req.body);
        const results = await Promise.allSettled(data.emails.map(async (email) => {
            const existing = await prisma_1.default.invitation.findUnique({
                where: { senderId_email: { senderId, email } },
            });
            if (existing) {
                if (existing.status === 'PENDING')
                    return { email, status: 'skipped' };
                return { email, status: 'already_joined' };
            }
            const recipient = await prisma_1.default.user.findUnique({ where: { email } });
            const invitation = await prisma_1.default.invitation.create({
                data: {
                    senderId,
                    email,
                    recipientId: recipient?.id ?? null,
                    channel: 'email',
                    status: recipient ? 'JOINED' : 'PENDING',
                },
            });
            return { email, status: 'sent', id: invitation.id };
        }));
        const sent = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'sent').length;
        const skipped = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'skipped').length;
        const joined = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'already_joined').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        res.json({
            success: true,
            message: `${sent} invitation(s) sent successfully.`,
            data: { sent, skipped, joined, failed },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendInvitations = sendInvitations;
const getInvitations = async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const invitations = await prisma_1.default.invitation.findMany({
            where: { senderId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                status: true,
                channel: true,
                createdAt: true,
                recipient: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        const formatted = invitations.map((inv) => ({
            id: inv.id,
            name: inv.recipient ? `${inv.recipient.firstName} ${inv.recipient.lastName}` : inv.email.split('@')[0],
            email: inv.email,
            status: inv.status,
            channel: inv.channel,
            date: inv.createdAt.toISOString(),
        }));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvitations = getInvitations;
const getReferralStats = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [totalInvites, joinedCount, activeCount, rewardsCount] = await Promise.all([
            prisma_1.default.invitation.count({ where: { senderId: userId } }),
            prisma_1.default.invitation.count({ where: { senderId: userId, status: 'JOINED' } }),
            prisma_1.default.invitation.count({ where: { senderId: userId, status: 'ACTIVE' } }),
            prisma_1.default.invitation.count({ where: { senderId: userId, status: { in: ['JOINED', 'ACTIVE'] } } }),
        ]);
        res.json({
            success: true,
            data: {
                invitesSent: totalInvites,
                joined: joinedCount,
                activeUsers: activeCount,
                rewardsEarned: rewardsCount,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReferralStats = getReferralStats;
const recordReferralShare = async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const { channel } = req.body;
        const existing = await prisma_1.default.invitation.findFirst({
            where: { senderId, channel: channel || 'link', status: 'PENDING' },
        });
        if (!existing) {
            await prisma_1.default.invitation.create({
                data: {
                    senderId,
                    email: `${channel || 'link'}_share`,
                    channel: channel || 'link',
                    status: 'PENDING',
                },
            });
        }
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.recordReferralShare = recordReferralShare;
