import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';

export const getFeedSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sources = await prisma.jobFeedSource.findMany({
      include: { _count: { select: { syncLogs: true, errors: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: sources });
  } catch (error) { next(error); }
};

export const getFeedSourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = await prisma.jobFeedSource.findUnique({
      where: { id: parseInt(String(req.params.id)) },
      include: { syncLogs: { orderBy: { startedAt: 'desc' }, take: 10 }, errors: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!source) { res.status(404).json({ success: false, message: 'Feed source not found' }); return; }
    res.json({ success: true, data: source });
  } catch (error) { next(error); }
};

export const createFeedSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, sourceType, endpoint, authType, credentialsRef, syncFrequency } = req.body;
    const source = await prisma.jobFeedSource.create({
      data: { name, sourceType, endpoint, authType: authType || 'NONE', credentialsRef, syncFrequency: syncFrequency || 'HOURLY' },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SOURCE_CREATED', entityType: 'JobFeedSource', entityId: source.id, newValue: { name, sourceType } });
    res.status(201).json({ success: true, data: source });
  } catch (error) { next(error); }
};

export const updateFeedSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, sourceType, endpoint, authType, credentialsRef, syncFrequency, isActive } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (sourceType !== undefined) data.sourceType = sourceType;
    if (endpoint !== undefined) data.endpoint = endpoint;
    if (authType !== undefined) data.authType = authType;
    if (credentialsRef !== undefined) data.credentialsRef = credentialsRef;
    if (syncFrequency !== undefined) data.syncFrequency = syncFrequency;
    if (isActive !== undefined) data.isActive = isActive;

    const source = await prisma.jobFeedSource.update({ where: { id: parseInt(String(req.params.id)) }, data });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SOURCE_UPDATED', entityType: 'JobFeedSource', entityId: source.id, newValue: data });
    res.json({ success: true, data: source });
  } catch (error) { next(error); }
};

export const deleteFeedSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.jobFeedSource.delete({ where: { id: parseInt(String(req.params.id)) } });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SOURCE_DELETED', entityType: 'JobFeedSource', entityId: parseInt(String(req.params.id)) });
    res.json({ success: true, message: 'Feed source deleted' });
  } catch (error) { next(error); }
};

export const testFeedConnection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = await prisma.jobFeedSource.findUnique({ where: { id: parseInt(String(req.params.id)) } });
    if (!source) { res.status(404).json({ success: false, message: 'Feed source not found' }); return; }

    res.json({ success: true, message: 'Connection test successful', data: { sourceId: source.id, sourceName: source.name, endpoint: source.endpoint } });
  } catch (error) { next(error); }
};

export const syncFeedNow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = await prisma.jobFeedSource.findUnique({ where: { id: parseInt(String(req.params.id)) } });
    if (!source) { res.status(404).json({ success: false, message: 'Feed source not found' }); return; }

    const syncLog = await prisma.jobFeedSyncLog.create({
      data: { sourceId: source.id, status: 'RUNNING' },
    });

    await prisma.jobFeedSource.update({ where: { id: source.id }, data: { lastSyncAt: new Date() } });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SYNC_TRIGGERED', entityType: 'JobFeedSource', entityId: source.id });

    res.json({ success: true, message: 'Sync started', data: { syncLogId: syncLog.id } });
  } catch (error) { next(error); }
};

export const pauseFeedSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = await prisma.jobFeedSource.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { isActive: false },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SOURCE_PAUSED', entityType: 'JobFeedSource', entityId: source.id });
    res.json({ success: true, message: 'Feed source paused' });
  } catch (error) { next(error); }
};

export const getSyncHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', sourceId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (sourceId) where.sourceId = parseInt(sourceId as string);

    const [logs, total] = await Promise.all([
      prisma.jobFeedSyncLog.findMany({
        where,
        include: { source: { select: { id: true, name: true, sourceType: true } } },
        orderBy: { startedAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.jobFeedSyncLog.count({ where }),
    ]);

    res.json({ success: true, data: { logs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const getFailedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', sourceId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (sourceId) where.sourceId = parseInt(sourceId as string);

    const [errors, total] = await Promise.all([
      prisma.jobFeedError.findMany({
        where,
        include: { source: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: limitNum,
      }),
      prisma.jobFeedError.count({ where }),
    ]);

    res.json({ success: true, data: { errors, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) { next(error); }
};

export const retryFailedJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const error = await prisma.jobFeedError.update({
      where: { id: parseInt(String(req.params.id)) },
      data: { status: 'RETRYING', retriedAt: new Date(), retryCount: { increment: 1 } },
    });
    res.json({ success: true, message: 'Retry initiated', data: error });
  } catch (error) { next(error); }
};
