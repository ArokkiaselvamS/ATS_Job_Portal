import prisma from '../utils/prisma';
import { SyncFrequency } from '@prisma/client';
import { syncFeedSource } from './feedConnector.service';

let schedulerInterval: NodeJS.Timeout | null = null;

export async function triggerSync(sourceId: number): Promise<void> {
  try {
    await syncFeedSource(sourceId);

    const source = await prisma.jobFeedSource.findUnique({ where: { id: sourceId } });
    if (!source) return;

    const nextSyncAt = calculateNextSyncAt(source.syncFrequency);

    await prisma.jobFeedSource.update({
      where: { id: sourceId },
      data: { nextSyncAt },
    });
  } catch (err: any) {
    console.error(`[Scheduler] Sync failed for source ${sourceId}: ${err.message}`);

    try {
      const source = await prisma.jobFeedSource.findUnique({ where: { id: sourceId } });
      if (source) {
        const nextSyncAt = calculateNextSyncAt(source.syncFrequency);
        await prisma.jobFeedSource.update({
          where: { id: sourceId },
          data: {
            nextSyncAt,
            syncErrorCount: { increment: 1 },
          },
        });
      }
    } catch {
      // Swallow secondary errors
    }
  }
}

export function calculateNextSyncAt(frequency: SyncFrequency): Date {
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

async function tick(): Promise<void> {
  try {
    const dueSources = await prisma.jobFeedSource.findMany({
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
  } catch (err: any) {
    console.error(`[Scheduler] Tick error: ${err.message}`);
  }
}

export function startScheduler(): void {
  if (schedulerInterval) {
    console.log('[Scheduler] Already running');
    return;
  }

  console.log('[Scheduler] Starting scheduler (interval: 60s)');
  schedulerInterval = setInterval(tick, 60_000);

  // Run immediately on start
  tick();
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Stopped');
  }
}
