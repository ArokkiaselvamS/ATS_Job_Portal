import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';

const sendInvitationsSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
});

export const sendInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const senderId = req.user!.userId;
    const data = sendInvitationsSchema.parse(req.body);

    const results = await Promise.allSettled(
      data.emails.map(async (email) => {
        const existing = await prisma.invitation.findUnique({
          where: { senderId_email: { senderId, email } },
        });

        if (existing) {
          if (existing.status === 'PENDING') return { email, status: 'skipped' as const };
          return { email, status: 'already_joined' as const };
        }

        const recipient = await prisma.user.findUnique({ where: { email } });

        const invitation = await prisma.invitation.create({
          data: {
            senderId,
            email,
            recipientId: recipient?.id ?? null,
            channel: 'email',
            status: recipient ? 'JOINED' : 'PENDING',
          },
        });

        return { email, status: 'sent' as const, id: invitation.id };
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'sent').length;
    const skipped = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'skipped').length;
    const joined = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'already_joined').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `${sent} invitation(s) sent successfully.`,
      data: { sent, skipped, joined, failed },
    });
  } catch (error) {
    next(error);
  }
};

export const getInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const senderId = req.user!.userId;

    const invitations = await prisma.invitation.findMany({
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
  } catch (error) {
    next(error);
  }
};

export const getReferralStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [totalInvites, joinedCount, activeCount, rewardsCount] = await Promise.all([
      prisma.invitation.count({ where: { senderId: userId } }),
      prisma.invitation.count({ where: { senderId: userId, status: 'JOINED' } }),
      prisma.invitation.count({ where: { senderId: userId, status: 'ACTIVE' } }),
      prisma.invitation.count({ where: { senderId: userId, status: { in: ['JOINED', 'ACTIVE'] } } }),
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
  } catch (error) {
    next(error);
  }
};

export const recordReferralShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const senderId = req.user!.userId;
    const { channel } = req.body as { channel?: string };

    const existing = await prisma.invitation.findFirst({
      where: { senderId, channel: channel || 'link', status: 'PENDING' },
    });

    if (!existing) {
      await prisma.invitation.create({
        data: {
          senderId,
          email: `${channel || 'link'}_share`,
          channel: channel || 'link',
          status: 'PENDING',
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
