import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '50', search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        include: { category: { select: { id: true, name: true } }, _count: { select: { aliases: true } } },
        orderBy: { name: 'asc' },
        skip, take: limitNum,
      }),
      prisma.skill.count({ where }),
    ]);

    res.json({ success: true, data: { skills, total, page: pageNum, limit: limitNum } });
  } catch (error) { next(error); }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, categoryId } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const skill = await prisma.skill.create({
      data: { name, slug, categoryId: categoryId || undefined },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'SKILL_CREATED', entityType: 'Skill', entityId: skill.id, newValue: { name } });
    res.status(201).json({ success: true, data: skill });
  } catch (error) { next(error); }
};

export const updateSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, categoryId, isActive, canonicalId } = req.body;
    const data: any = {};
    if (name !== undefined) { data.name = name; data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isActive !== undefined) data.isActive = isActive;
    if (canonicalId !== undefined) data.canonicalId = canonicalId;

    const skill = await prisma.skill.update({ where: { id: parseInt(String(req.params.id)) }, data });
    await createAuditLog({ adminId: req.user!.userId, action: 'SKILL_UPDATED', entityType: 'Skill', entityId: skill.id, newValue: data });
    res.json({ success: true, data: skill });
  } catch (error) { next(error); }
};

export const mergeSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetSkillId, sourceSkillIds } = req.body;
    const target = await prisma.skill.findUnique({ where: { id: targetSkillId } });
    if (!target) { res.status(404).json({ success: false, message: 'Target skill not found' }); return; }

    await prisma.skill.updateMany({ where: { id: { in: sourceSkillIds } }, data: { canonicalId: targetSkillId } });
    await createAuditLog({ adminId: req.user!.userId, action: 'SKILLS_MERGED', entityType: 'Skill', entityId: targetSkillId, newValue: { mergedFrom: sourceSkillIds } });
    res.json({ success: true, message: 'Skills merged' });
  } catch (error) { next(error); }
};
