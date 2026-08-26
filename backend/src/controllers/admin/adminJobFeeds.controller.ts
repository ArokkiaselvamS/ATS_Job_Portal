import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { createAuditLog } from '../../services/audit.service';
import { fetchAndNormalizeJobs, syncFeedSource } from '../../services/feedConnector.service';
import { encrypt, decrypt } from '../../utils/crypto';

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
    const { name, sourceType, endpoint, authType, credentialsRef, syncFrequency, testConnection, initialSync } = req.body;
    
    // Encrypt credentials if provided
    const encryptedCredentials = credentialsRef ? encrypt(credentialsRef) : null;
    
    const source = await prisma.jobFeedSource.create({
      data: { 
        name, 
        sourceType, 
        endpoint, 
        authType: authType || 'NONE', 
        credentialsRef: encryptedCredentials, 
        syncFrequency: syncFrequency || 'HOURLY' 
      },
    });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SOURCE_CREATED', entityType: 'JobFeedSource', entityId: source.id, newValue: { name, sourceType } });
    
    // Test connection if requested
    if (testConnection && endpoint) {
      let credentials = null;
      if (encryptedCredentials) {
        try {
          credentials = decrypt(encryptedCredentials);
        } catch {
          // Ignore decryption errors
        }
      }
      
      const headers: Record<string, string> = {};
      if (credentials) {
        if (authType === 'API_KEY') headers['Authorization'] = `Bearer ${credentials}`;
        else if (authType === 'BEARER') headers['Authorization'] = `Bearer ${credentials}`;
        else if (authType === 'BASIC') headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
      }
      
      try {
        const response = await fetch(endpoint, { 
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          const safeSource = { ...source, credentialsRef: undefined };
          res.status(201).json({ 
            success: true, 
            data: safeSource,
            warning: `Source created but connection test failed: ${response.status} ${response.statusText}`
          });
          return;
        }
      } catch (testError: any) {
        const safeSource = { ...source, credentialsRef: undefined };
        res.status(201).json({ 
          success: true, 
          data: safeSource,
          warning: `Source created but connection test failed: ${testError.message}`
        });
        return;
      }
    }
    
    // Perform initial sync if requested
    if (initialSync && endpoint) {
      // Update source to active
      await prisma.jobFeedSource.update({
        where: { id: source.id },
        data: { isActive: true }
      });
      
      // Start sync in background
      syncFeedSource(source.id).then(async (result) => {
        const totalJobs = await prisma.job.count({
          where: { feedSourceId: source.id, status: 'ACTIVE' },
        });
        await prisma.jobFeedSource.update({
          where: { id: source.id },
          data: {
            totalJobs,
            syncErrorCount: result.errors.length > 0 ? { increment: 1 } : { set: 0 },
          },
        });
      }).catch(async (err: any) => {
        await prisma.jobFeedSource.update({
          where: { id: source.id },
          data: { syncErrorCount: { increment: 1 } },
        });
      });
    }
    
    // Return source without credentials
    const safeSource = { ...source, credentialsRef: undefined };
    res.status(201).json({ success: true, data: safeSource });
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
    if (credentialsRef !== undefined) data.credentialsRef = encrypt(credentialsRef);
    if (syncFrequency !== undefined) data.syncFrequency = syncFrequency;
    if (isActive !== undefined) data.isActive = isActive;

    const source = await prisma.jobFeedSource.update({ where: { id: parseInt(String(req.params.id)) }, data });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SOURCE_UPDATED', entityType: 'JobFeedSource', entityId: source.id, newValue: data });
    
    // Return source without credentials
    const safeSource = { ...source, credentialsRef: undefined };
    res.json({ success: true, data: safeSource });
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

    if (!source.endpoint) {
      res.status(400).json({ success: false, message: 'No endpoint configured for this feed source' });
      return;
    }

    // Decrypt credentials if present
    let credentials = null;
    if (source.credentialsRef) {
      try {
        credentials = decrypt(source.credentialsRef);
      } catch {
        res.json({ success: false, message: 'Failed to decrypt credentials' });
        return;
      }
    }

    // Prepare headers for authentication
    const headers: Record<string, string> = {};
    if (credentials) {
      if (source.authType === 'API_KEY') {
        headers['Authorization'] = `Bearer ${credentials}`;
      } else if (source.authType === 'BEARER') {
        headers['Authorization'] = `Bearer ${credentials}`;
      } else if (source.authType === 'BASIC') {
        headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
      }
    }

    const response = await fetch(source.endpoint, { 
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      res.json({ 
        success: false, 
        message: `Connection failed: ${response.status} ${response.statusText}` 
      });
      return;
    }

    // Try to parse response to verify it's valid JSON
    try {
      await response.json();
      res.json({ success: true, message: 'Connection successful' });
    } catch {
      // Try text response
      const text = await response.text();
      if (text.trim().startsWith('<') || text.trim().startsWith('<?xml')) {
        res.json({ success: true, message: 'Connection successful (RSS/XML feed)' });
      } else {
        res.json({ success: false, message: 'Response is not valid JSON or RSS/XML' });
      }
    }
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      res.json({ success: false, message: 'Connection timed out' });
    } else {
      res.json({ success: false, message: `Connection failed: ${error.message}` });
    }
  }
};

export const syncFeedNow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = await prisma.jobFeedSource.findUnique({ where: { id: parseInt(String(req.params.id)) } });
    if (!source) { res.status(404).json({ success: false, message: 'Feed source not found' }); return; }

    if (!source.isActive) {
      res.status(400).json({ success: false, message: 'Feed source is not active' });
      return;
    }

    const syncLog = await prisma.jobFeedSyncLog.create({
      data: { sourceId: source.id, status: 'RUNNING' },
    });

    await prisma.jobFeedSource.update({ where: { id: source.id }, data: { lastSyncAt: new Date() } });
    await createAuditLog({ adminId: req.user!.userId, action: 'FEED_SYNC_TRIGGERED', entityType: 'JobFeedSource', entityId: source.id });

    // Start sync in background
    syncFeedSource(source.id).then(async (result) => {
      await prisma.jobFeedSyncLog.update({
        where: { id: syncLog.id },
        data: {
          completedAt: new Date(),
          status: result.errors.length > 0 ? 'PARTIAL' : 'COMPLETED',
          fetchedCount: result.fetched,
          newCount: result.new,
          updatedCount: result.updated,
          expiredCount: result.expired,
          duplicateCount: result.duplicates,
          errorCount: result.errors.length,
          errorDetails: result.errors.length > 0 ? result.errors.join('\n') : null,
        },
      });

      const totalJobs = await prisma.job.count({
        where: { feedSourceId: source.id, status: 'ACTIVE' },
      });

      await prisma.jobFeedSource.update({
        where: { id: source.id },
        data: {
          totalJobs,
          syncErrorCount: result.errors.length > 0 ? { increment: 1 } : { set: 0 },
        },
      });
    }).catch(async (err: any) => {
      await prisma.jobFeedSyncLog.update({
        where: { id: syncLog.id },
        data: {
          completedAt: new Date(),
          status: 'FAILED',
          errorCount: 1,
          errorDetails: err.message,
        },
      });
      await prisma.jobFeedSource.update({
        where: { id: source.id },
        data: { syncErrorCount: { increment: 1 } },
      });
    });

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
