import { Request, Response, NextFunction } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notification.service';
import prisma from '../../utils/prisma';

export const listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page, limit } = req.query;
    const result = await getNotifications(userId, page ? parseInt(page as string) : 1, limit ? parseInt(limit as string) : 20);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await markAsRead(parseInt(String(req.params.id)), req.user!.userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) { next(error); }
};

export const markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await markAllAsRead(req.user!.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

export const sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, type, title, message } = req.body;
    const notification = await prisma.notification.create({
      data: { userId, type, title, message },
    });
    res.status(201).json({ success: true, data: notification });
  } catch (error) { next(error); }
};
