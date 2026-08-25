"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSync = triggerSync;
exports.calculateNextSyncAt = calculateNextSyncAt;
exports.startScheduler = startScheduler;
exports.stopScheduler = stopScheduler;
const prisma_1 = __importDefault(require("../utils/prisma"));
const feedConnector_service_1 = require("./feedConnector.service");
let schedulerInterval = null;
async function triggerSync(sourceId) {
    try {
        await (0, feedConnector_service_1.syncFeedSource)(sourceId);
        const source = await prisma_1.default.jobFeedSource.findUnique({ where: { id: sourceId } });
        if (!source)
            return;
        const nextSyncAt = calculateNextSyncAt(source.syncFrequency);
        await prisma_1.default.jobFeedSource.update({
            where: { id: sourceId },
            data: { nextSyncAt },
        });
    }
    catch (err) {
        console.error(`[Scheduler] Sync failed for source ${sourceId}: ${err.message}`);
        try {
            const source = await prisma_1.default.jobFeedSource.findUnique({ where: { id: sourceId } });
            if (source) {
                const nextSyncAt = calculateNextSyncAt(source.syncFrequency);
                await prisma_1.default.jobFeedSource.update({
                    where: { id: sourceId },
                    data: {
                        nextSyncAt,
                        syncErrorCount: { increment: 1 },
                    },
                });
            }
        }
        catch {
            // Swallow secondary errors
        }
    }
}
function calculateNextSyncAt(frequency) {
    const now = new Date();
    switch (frequency) {
        case 'EVERY_15_MIN':
            return new Date(now.getTime() + 15 * 60 * 1000);
        case 'EVERY_30_MIN':
            return new Date(now.getTime() + 30 * 60 * 1000);
        case 'HOURLY':
            return new Date(now.getTime() + 60 * 60 * 1000);
        case 'EVERY_6_HOURS':
            return new Date(now.getTime() + 6 * 60 * 60 * 1000);
        case 'EVERY_12_HOURS':
            return new Date(now.getTime() + 12 * 60 * 60 * 1000);
        case 'DAILY':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() + 60 * 60 * 1000);
    }
}
async function tick() {
    try {
        const dueSources = await prisma_1.default.jobFeedSource.findMany({
            where: {
                isActive: true,
                nextSyncAt: { lte: new Date() },
            },
            select: { id: true, name: true },
        });
        for (const source of dueSources) {
            console.log(`[Scheduler] Triggering sync for source: ${source.name} (${source.id})`);
            await triggerSync(source.id);
        }
    }
    catch (err) {
        console.error(`[Scheduler] Tick error: ${err.message}`);
    }
}
function startScheduler() {
    if (schedulerInterval) {
        console.log('[Scheduler] Already running');
        return;
    }
    console.log('[Scheduler] Starting scheduler (interval: 60s)');
    schedulerInterval = setInterval(tick, 60_000);
    // Run immediately on start
    tick();
}
function stopScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('[Scheduler] Stopped');
    }
}
