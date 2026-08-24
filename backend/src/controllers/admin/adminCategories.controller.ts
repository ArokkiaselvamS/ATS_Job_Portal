import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { jobs: true, skills: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = await prisma.category.create({ data: { name, slug, description } });
    await createAuditLog({ adminId: req.user!.userId, action: 'CATEGORY_CREATED', entityType: 'Category', entityId: category.id, newValue: { name } });
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, isActive } = req.body;
    const data: any = {};
    if (name !== undefined) { data.name = name; data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    if (description !== undefined) data.description = description;
    if (isActive !== undefined) data.isActive = isActive;

    const category = await prisma.category.update({ where: { id: parseInt(String(req.params.id)) }, data });
    await createAuditLog({ adminId: req.user!.userId, action: 'CATEGORY_UPDATED', entityType: 'Category', entityId: category.id, newValue: data });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
};
