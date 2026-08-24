import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
    const grouped: Record<string, any[]> = {};
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push({ key: s.key, value: s.value, updatedAt: s.updatedAt });
    }
    res.json({ success: true, data: grouped });
  } catch (error) { next(error); }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { settings } = req.body;
    for (const { key, value, category } of settings) {
      await prisma.platformSetting.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category },
      });
    }
    await createAuditLog({ adminId: req.user!.userId, action: 'SETTINGS_UPDATED', entityType: 'PlatformSetting', newValue: { settings } });
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) { next(error); }
};
