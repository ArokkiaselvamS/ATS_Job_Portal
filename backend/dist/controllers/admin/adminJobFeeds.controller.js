"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryFailedJob = exports.getFailedJobs = exports.getSyncHistory = exports.pauseFeedSource = exports.syncFeedNow = exports.testFeedConnection = exports.deleteFeedSource = exports.updateFeedSource = exports.createFeedSource = exports.getFeedSourceById = exports.getFeedSources = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const audit_service_1 = require("../../services/audit.service");
const feedConnector_service_1 = require("../../services/feedConnector.service");
const crypto_1 = require("../../utils/crypto");
const getFeedSources = async (req, res, next) => {
    try {
        const sources = await prisma_1.default.jobFeedSource.findMany({
            include: { _count: { select: { syncLogs: true, errors: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: sources });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeedSources = getFeedSources;
const getFeedSourceById = async (req, res, next) => {
    try {
        const source = await prisma_1.default.jobFeedSource.findUnique({
            where: { id: parseInt(String(req.params.id)) },
            include: { syncLogs: { orderBy: { startedAt: 'desc' }, take: 10 }, errors: { orderBy: { createdAt: 'desc' }, take: 10 } },
        });
        if (!source) {
            res.status(404).json({ success: false, message: 'Feed source not found' });
            return;
        }
        res.json({ success: true, data: source });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeedSourceById = getFeedSourceById;
const createFeedSource = async (req, res, next) => {
    try {
        const { name, sourceType, endpoint, authType, credentialsRef, syncFrequency, testConnection, initialSync } = req.body;
        // Encrypt credentials if provided
        const encryptedCredentials = credentialsRef ? (0, crypto_1.encrypt)(credentialsRef) : null;
        const source = await prisma_1.default.jobFeedSource.create({
            data: {
                name,
                sourceType,
                endpoint,
                authType: authType || 'NONE',
                credentialsRef: encryptedCredentials,
                syncFrequency: syncFrequency || 'HOURLY'
            },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'FEED_SOURCE_CREATED', entityType: 'JobFeedSource', entityId: source.id, newValue: { name, sourceType } });
        // Test connection if requested
        if (testConnection && endpoint) {
            let credentials = null;
            if (encryptedCredentials) {
                try {
                    credentials = (0, crypto_1.decrypt)(encryptedCredentials);
                }
                catch {
                    // Ignore decryption errors
                }
            }
            const headers = {};
            if (credentials) {
                if (authType === 'API_KEY')
                    headers['Authorization'] = `Bearer ${credentials}`;
                else if (authType === 'BEARER')
                    headers['Authorization'] = `Bearer ${credentials}`;
                else if (authType === 'BASIC')
                    headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
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
            }
            catch (testError) {
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
            await prisma_1.default.jobFeedSource.update({
                where: { id: source.id },
                data: { isActive: true }
            });
            // Start sync in background
            (0, feedConnector_service_1.syncFeedSource)(source.id).then(async (result) => {
                const totalJobs = await prisma_1.default.job.count({
                    where: { feedSourceId: source.id, status: 'ACTIVE' },
                });
                await prisma_1.default.jobFeedSource.update({
                    where: { id: source.id },
                    data: {
                        totalJobs,
                        syncErrorCount: result.errors.length > 0 ? { increment: 1 } : { set: 0 },
                    },
                });
            }).catch(async (err) => {
                await prisma_1.default.jobFeedSource.update({
                    where: { id: source.id },
                    data: { syncErrorCount: { increment: 1 } },
                });
            });
        }
        // Return source without credentials
        const safeSource = { ...source, credentialsRef: undefined };
        res.status(201).json({ success: true, data: safeSource });
    }
    catch (error) {
        next(error);
    }
};
exports.createFeedSource = createFeedSource;
const updateFeedSource = async (req, res, next) => {
    try {
        const { name, sourceType, endpoint, authType, credentialsRef, syncFrequency, isActive } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (sourceType !== undefined)
            data.sourceType = sourceType;
        if (endpoint !== undefined)
            data.endpoint = endpoint;
        if (authType !== undefined)
            data.authType = authType;
        if (credentialsRef !== undefined)
            data.credentialsRef = (0, crypto_1.encrypt)(credentialsRef);
        if (syncFrequency !== undefined)
            data.syncFrequency = syncFrequency;
        if (isActive !== undefined)
            data.isActive = isActive;
        const source = await prisma_1.default.jobFeedSource.update({ where: { id: parseInt(String(req.params.id)) }, data });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'FEED_SOURCE_UPDATED', entityType: 'JobFeedSource', entityId: source.id, newValue: data });
        // Return source without credentials
        const safeSource = { ...source, credentialsRef: undefined };
        res.json({ success: true, data: safeSource });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFeedSource = updateFeedSource;
const deleteFeedSource = async (req, res, next) => {
    try {
        await prisma_1.default.jobFeedSource.delete({ where: { id: parseInt(String(req.params.id)) } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'FEED_SOURCE_DELETED', entityType: 'JobFeedSource', entityId: parseInt(String(req.params.id)) });
        res.json({ success: true, message: 'Feed source deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFeedSource = deleteFeedSource;
const testFeedConnection = async (req, res, next) => {
    try {
        const source = await prisma_1.default.jobFeedSource.findUnique({ where: { id: parseInt(String(req.params.id)) } });
        if (!source) {
            res.status(404).json({ success: false, message: 'Feed source not found' });
            return;
        }
        if (!source.endpoint) {
            res.status(400).json({ success: false, message: 'No endpoint configured for this feed source' });
            return;
        }
        // Decrypt credentials if present
        let credentials = null;
        if (source.credentialsRef) {
            try {
                credentials = (0, crypto_1.decrypt)(source.credentialsRef);
            }
            catch {
                res.json({ success: false, message: 'Failed to decrypt credentials' });
                return;
            }
        }
        // Prepare headers for authentication
        const headers = {};
        if (credentials) {
            if (source.authType === 'API_KEY') {
                headers['Authorization'] = `Bearer ${credentials}`;
            }
            else if (source.authType === 'BEARER') {
                headers['Authorization'] = `Bearer ${credentials}`;
            }
            else if (source.authType === 'BASIC') {
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
        }
        catch {
            // Try text response
            const text = await response.text();
            if (text.trim().startsWith('<') || text.trim().startsWith('<?xml')) {
                res.json({ success: true, message: 'Connection successful (RSS/XML feed)' });
            }
            else {
                res.json({ success: false, message: 'Response is not valid JSON or RSS/XML' });
            }
        }
    }
    catch (error) {
        if (error.name === 'TimeoutError') {
            res.json({ success: false, message: 'Connection timed out' });
        }
        else {
            res.json({ success: false, message: `Connection failed: ${error.message}` });
        }
    }
};
exports.testFeedConnection = testFeedConnection;
const syncFeedNow = async (req, res, next) => {
    try {
        const source = await prisma_1.default.jobFeedSource.findUnique({ where: { id: parseInt(String(req.params.id)) } });
        if (!source) {
            res.status(404).json({ success: false, message: 'Feed source not found' });
            return;
        }
        if (!source.isActive) {
            res.status(400).json({ success: false, message: 'Feed source is not active' });
            return;
        }
        const syncLog = await prisma_1.default.jobFeedSyncLog.create({
            data: { sourceId: source.id, status: 'RUNNING' },
        });
        await prisma_1.default.jobFeedSource.update({ where: { id: source.id }, data: { lastSyncAt: new Date() } });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'FEED_SYNC_TRIGGERED', entityType: 'JobFeedSource', entityId: source.id });
        // Start sync in background
        (0, feedConnector_service_1.syncFeedSource)(source.id).then(async (result) => {
            await prisma_1.default.jobFeedSyncLog.update({
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
            const totalJobs = await prisma_1.default.job.count({
                where: { feedSourceId: source.id, status: 'ACTIVE' },
            });
            await prisma_1.default.jobFeedSource.update({
                where: { id: source.id },
                data: {
                    totalJobs,
                    syncErrorCount: result.errors.length > 0 ? { increment: 1 } : { set: 0 },
                },
            });
        }).catch(async (err) => {
            await prisma_1.default.jobFeedSyncLog.update({
                where: { id: syncLog.id },
                data: {
                    completedAt: new Date(),
                    status: 'FAILED',
                    errorCount: 1,
                    errorDetails: err.message,
                },
            });
            await prisma_1.default.jobFeedSource.update({
                where: { id: source.id },
                data: { syncErrorCount: { increment: 1 } },
            });
        });
        res.json({ success: true, message: 'Sync started', data: { syncLogId: syncLog.id } });
    }
    catch (error) {
        next(error);
    }
};
exports.syncFeedNow = syncFeedNow;
const pauseFeedSource = async (req, res, next) => {
    try {
        const source = await prisma_1.default.jobFeedSource.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { isActive: false },
        });
        await (0, audit_service_1.createAuditLog)({ adminId: req.user.userId, action: 'FEED_SOURCE_PAUSED', entityType: 'JobFeedSource', entityId: source.id });
        res.json({ success: true, message: 'Feed source paused' });
    }
    catch (error) {
        next(error);
    }
};
exports.pauseFeedSource = pauseFeedSource;
const getSyncHistory = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', sourceId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (sourceId)
            where.sourceId = parseInt(sourceId);
        const [logs, total] = await Promise.all([
            prisma_1.default.jobFeedSyncLog.findMany({
                where,
                include: { source: { select: { id: true, name: true, sourceType: true } } },
                orderBy: { startedAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.jobFeedSyncLog.count({ where }),
        ]);
        res.json({ success: true, data: { logs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getSyncHistory = getSyncHistory;
const getFailedJobs = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', sourceId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (sourceId)
            where.sourceId = parseInt(sourceId);
        const [errors, total] = await Promise.all([
            prisma_1.default.jobFeedError.findMany({
                where,
                include: { source: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip, take: limitNum,
            }),
            prisma_1.default.jobFeedError.count({ where }),
        ]);
        res.json({ success: true, data: { errors, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getFailedJobs = getFailedJobs;
const retryFailedJob = async (req, res, next) => {
    try {
        const error = await prisma_1.default.jobFeedError.update({
            where: { id: parseInt(String(req.params.id)) },
            data: { status: 'RETRYING', retriedAt: new Date(), retryCount: { increment: 1 } },
        });
        res.json({ success: true, message: 'Retry initiated', data: error });
    }
    catch (error) {
        next(error);
    }
};
exports.retryFailedJob = retryFailedJob;
