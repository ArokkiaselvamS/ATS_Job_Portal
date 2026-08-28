import prisma from '../utils/prisma';
import {
  FeedSourceType,
  FeedErrorStatus,
  JobSource,
  JobStatus,
  SyncStatus,
} from '@prisma/client';
import { decrypt } from '../utils/crypto';

// ─── TYPES ────────────────────────────────────────────────

export interface NormalizedJob {
  externalJobId: string;
  title: string;
  description: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  city?: string;
  country?: string;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills: string[];
  department?: string;
  applyUrl: string;
  jobUrl?: string;
  postedAt: Date;
  expiresAt?: Date;
  rawData?: any;
}

export interface SyncResult {
  fetched: number;
  new: number;
  updated: number;
  duplicates: number;
  expired: number;
  errors: string[];
}

interface FeedSourceRecord {
  id: number;
  name: string;
  sourceType: FeedSourceType;
  endpoint: string | null;
  authType: string;
  credentialsRef: string | null;
  syncFrequency: string;
  totalJobs: number;
  syncErrorCount: number;
}

interface FeedConnector {
  fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]>;
}

function getAuthHeaders(source: FeedSourceRecord): Record<string, string> {
  const headers: Record<string, string> = {};
  
  let credentials: string | null = null;
  if (source.credentialsRef) {
    try {
      credentials = decrypt(source.credentialsRef);
    } catch {
      // If decryption fails, proceed without credentials
    }
  }
  
  if (credentials) {
    if (source.authType === 'API_KEY') {
      headers['Authorization'] = `Bearer ${credentials}`;
    } else if (source.authType === 'BEARER') {
      headers['Authorization'] = `Bearer ${credentials}`;
    } else if (source.authType === 'BASIC') {
      headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
    }
  }
  
  return headers;
}

// ─── CONNECTORS ───────────────────────────────────────────

class GreenhouseConnector implements FeedConnector {
  async fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]> {
    // Use endpoint as-is; user provides full URL including ?content=true
    const url = source.endpoint!;
    const headers = getAuthHeaders(source);
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`Greenhouse API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json() as any;
    const jobs: any[] = data.jobs ?? [];

    return jobs.map((job) => this.normalizeJob(job, source.name));
  }

  private normalizeJob(job: any, companyName: string): NormalizedJob {
    const locationName: string = job.location?.name ?? '';
    const workMode = this.inferWorkMode(locationName);
    const departments: string[] = (job.departments ?? []).map((d: any) => d.name);
    const department = departments.join(', ') || undefined;

    return {
      externalJobId: String(job.id),
      title: job.title ?? '',
      description: job.content ?? job.description ?? '',
      companyName: job.company_name ?? companyName,
      companyLogo: undefined,
      location: locationName || undefined,
      city: this.extractCity(locationName),
      country: this.extractCountry(locationName),
      workMode,
      jobType: 'FULL_TIME',
      experienceLevel: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: undefined,
      skills: departments,
      department,
      applyUrl: job.absolute_url
        ? `https://boards.greenhouse.io${job.absolute_url}`
        : '',
      jobUrl: job.absolute_url
        ? `https://boards.greenhouse.io${job.absolute_url}`
        : undefined,
      postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
      expiresAt: undefined,
      rawData: job,
    };
  }

  private inferWorkMode(location: string): 'REMOTE' | 'HYBRID' | 'ONSITE' {
    const lower = location.toLowerCase();
    if (lower.includes('remote')) return 'REMOTE';
    if (lower.includes('hybrid')) return 'HYBRID';
    return 'ONSITE';
  }

  private extractCity(location: string): string | undefined {
    const parts = location.split(',').map((p: string) => p.trim());
    return parts[0] || undefined;
  }

  private extractCountry(location: string): string | undefined {
    const parts = location.split(',').map((p: string) => p.trim());
    return parts[parts.length - 1] || undefined;
  }
}

class LeverConnector implements FeedConnector {
  async fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]> {
    const headers = getAuthHeaders(source);
    const res = await fetch(source.endpoint!, { headers });

    if (!res.ok) {
      throw new Error(`Lever API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json() as any;
    const jobs: any[] = Array.isArray(data) ? data : data.data ?? [];

    return jobs.map((job) => this.normalizeJob(job, source.name));
  }

  private normalizeJob(job: any, companyName: string): NormalizedJob {
    const locationName = job.categories?.location ?? job.location ?? '';
    const workMode = this.inferWorkMode(locationName, job.categories?.commitment);

    return {
      externalJobId: String(job.id),
      title: job.text ?? job.title ?? '',
      description: job.descriptionPlain ?? job.description ?? '',
      companyName,
      companyLogo: undefined,
      location: locationName || undefined,
      city: undefined,
      country: undefined,
      workMode,
      jobType: this.mapCommitment(job.categories?.commitment),
      experienceLevel: job.categories?.experienceLevel,
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: undefined,
      skills: job.categories?.team ? [job.categories.team] : [],
      department: job.categories?.team ?? undefined,
      applyUrl: job.hostedUrl ?? job.applyUrl ?? '',
      jobUrl: job.hostedUrl ?? undefined,
      postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
      expiresAt: undefined,
      rawData: job,
    };
  }

  private inferWorkMode(location: string, commitment?: string): 'REMOTE' | 'HYBRID' | 'ONSITE' {
    const lower = location.toLowerCase();
    const commitLower = (commitment ?? '').toLowerCase();
    if (lower.includes('remote') || commitLower.includes('remote')) return 'REMOTE';
    if (lower.includes('hybrid') || commitLower.includes('hybrid')) return 'HYBRID';
    return 'ONSITE';
  }

  private mapCommitment(commitment?: string): 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' {
    const lower = (commitment ?? '').toLowerCase();
    if (lower.includes('part')) return 'PART_TIME';
    if (lower.includes('contract')) return 'CONTRACT';
    if (lower.includes('intern')) return 'INTERNSHIP';
    return 'FULL_TIME';
  }
}

class RemotiveConnector implements FeedConnector {
  async fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]> {
    const headers = getAuthHeaders(source);
    const res = await fetch(source.endpoint!, { headers });

    if (!res.ok) {
      throw new Error(`Remotive API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json() as any;
    const jobs: any[] = data.jobs ?? data ?? [];

    return jobs.map((job) => this.normalizeJob(job));
  }

  private normalizeJob(job: any): NormalizedJob {
    const locationStr = job.location ?? '';
    const workMode = locationStr.toLowerCase().includes('remote') ? 'REMOTE' : 'ONSITE';

    return {
      externalJobId: String(job.id),
      title: job.title ?? '',
      description: job.description ?? '',
      companyName: job.company_name ?? job.company ?? '',
      companyLogo: job.company_logo ?? undefined,
      location: locationStr || undefined,
      city: undefined,
      country: undefined,
      workMode,
      jobType: 'FULL_TIME',
      experienceLevel: undefined,
      salaryMin: job.salary_min ? parseFloat(job.salary_min) : undefined,
      salaryMax: job.salary_max ? parseFloat(job.salary_max) : undefined,
      salaryCurrency: job.salary_currency ?? 'USD',
      skills: job.tags ?? job.categories ?? [],
      applyUrl: job.url ?? job.apply_url ?? '',
      postedAt: job.pubDate ? new Date(job.pubDate) : job.date ? new Date(job.date) : new Date(),
      expiresAt: undefined,
      rawData: job,
    };
  }
}

class ArbeitnowConnector implements FeedConnector {
  async fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]> {
    const headers = getAuthHeaders(source);
    const res = await fetch(source.endpoint!, { headers });

    if (!res.ok) {
      throw new Error(`Arbeitnow API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json() as any;
    const jobs: any[] = data.data ?? data ?? [];

    return jobs.map((job) => this.normalizeJob(job));
  }

  private normalizeJob(job: any): NormalizedJob {
    const locationStr = job.location ?? '';
    const workModeStr = (job.remote ?? '').toString().toLowerCase();
    const workMode = workModeStr === 'true' || workModeStr === 'yes' ? 'REMOTE' : 'ONSITE';

    const jobTypeStr = (job.job_type ?? job.jobType ?? 'FULL_TIME').toString().toUpperCase().replace(/\s+/g, '_');
    let jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' = 'FULL_TIME';
    if (jobTypeStr === 'PART_TIME') jobType = 'PART_TIME';
    else if (jobTypeStr === 'CONTRACT') jobType = 'CONTRACT';
    else if (jobTypeStr === 'INTERNSHIP') jobType = 'INTERNSHIP';

    return {
      externalJobId: String(job.id ?? job.slug ?? ''),
      title: job.title ?? '',
      description: job.description ?? '',
      companyName: job.company_name ?? job.company ?? '',
      companyLogo: job.company_logo ?? undefined,
      location: locationStr || undefined,
      city: job.city ?? undefined,
      country: job.country ?? undefined,
      workMode,
      jobType,
      experienceLevel: job.experience_level ?? job.experienceLevel ?? undefined,
      salaryMin: job.salary_min ? parseFloat(job.salary_min) : undefined,
      salaryMax: job.salary_max ? parseFloat(job.salary_max) : undefined,
      salaryCurrency: job.salary_currency ?? job.currency ?? 'EUR',
      skills: job.tags ?? job.technologies ?? job.skills ?? [],
      applyUrl: job.url ?? job.apply_url ?? job.link ?? '',
      postedAt: job.posted_at ? new Date(job.posted_at) : job.created_at ? new Date(job.created_at) : new Date(),
      expiresAt: job.expires_at ? new Date(job.expires_at) : undefined,
      rawData: job,
    };
  }
}

class GenericApiConnector implements FeedConnector {
  async fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]> {
    const headers = getAuthHeaders(source);
    const res = await fetch(source.endpoint!, { headers });

    if (!res.ok) {
      throw new Error(`Generic API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json() as any;
    const items: any[] = Array.isArray(data) ? data : data.jobs ?? data.data ?? data.results ?? [];

    return items.map((item) => this.normalizeItem(item));
  }

  private normalizeItem(item: any): NormalizedJob {
    const locationStr: string = item.location ?? item.location_name ?? item.locationName ?? '';
    const workModeStr: string = (item.work_mode ?? item.workMode ?? item.remote ?? '').toString().toUpperCase();
    let workMode: 'REMOTE' | 'HYBRID' | 'ONSITE' = 'ONSITE';
    if (workModeStr === 'REMOTE') workMode = 'REMOTE';
    else if (workModeStr === 'HYBRID') workMode = 'HYBRID';

    const jobTypeStr: string = (item.job_type ?? item.jobType ?? item.employment_type ?? 'FULL_TIME').toString().toUpperCase().replace(/\s+/g, '_');
    let jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' = 'FULL_TIME';
    if (jobTypeStr === 'PART_TIME') jobType = 'PART_TIME';
    else if (jobTypeStr === 'CONTRACT') jobType = 'CONTRACT';
    else if (jobTypeStr === 'INTERNSHIP') jobType = 'INTERNSHIP';

    const skillsRaw = item.skills ?? item.tags ?? item.technologies ?? [];
    const skills = Array.isArray(skillsRaw) ? skillsRaw.map(String) : [];

    return {
      externalJobId: String(item.id ?? item.job_id ?? item.jobId ?? item.external_id ?? ''),
      title: item.title ?? item.job_title ?? item.jobTitle ?? item.name ?? '',
      description: item.description ?? item.summary ?? item.body ?? '',
      companyName: item.company ?? item.company_name ?? item.companyName ?? item.organization ?? '',
      companyLogo: item.company_logo ?? item.companyLogo ?? item.logo ?? undefined,
      location: locationStr || undefined,
      city: (item.city ?? undefined) as string | undefined,
      country: (item.country ?? undefined) as string | undefined,
      workMode,
      jobType,
      experienceLevel: item.experience_level ?? item.experienceLevel ?? item.seniority ?? undefined,
      salaryMin: item.salary_min ?? item.salaryMin ?? item.salary_min_amount ?? undefined,
      salaryMax: item.salary_max ?? item.salaryMax ?? item.salary_max_amount ?? undefined,
      salaryCurrency: item.salary_currency ?? item.salaryCurrency ?? item.currency ?? undefined,
      skills,
      department: item.department ?? item.department_name ?? undefined,
      applyUrl: item.apply_url ?? item.applyUrl ?? item.url ?? item.link ?? item.application_url ?? '',
      jobUrl: item.url ?? item.link ?? item.job_url ?? undefined,
      postedAt: item.posted_at ?? item.postedAt ?? item.published_at ?? item.created_at ?? new Date(),
      expiresAt: item.expires_at ?? item.expiresAt ?? item.deadline ?? undefined,
      rawData: item,
    };
  }
}

class RSSConnector implements FeedConnector {
  async fetchJobs(source: FeedSourceRecord): Promise<NormalizedJob[]> {
    const headers = getAuthHeaders(source);
    const res = await fetch(source.endpoint!, { headers });

    if (!res.ok) {
      throw new Error(`RSS feed returned ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    return this.parseRSS(text);
  }

  private parseRSS(xml: string): NormalizedJob[] {
    const items: NormalizedJob[] = [];
    const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi)
      ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi)
      ?? [];

    for (const itemXml of itemMatches) {
      const title = this.extractTag(itemXml, 'title');
      const link = this.extractTag(itemXml, 'link')
        ?? this.extractAttribute(itemXml, 'link', 'href');
      const description = this.extractTag(itemXml, 'description')
        ?? this.extractTag(itemXml, 'summary')
        ?? this.extractTag(itemXml, 'content');
      const pubDate = this.extractTag(itemXml, 'pubDate')
        ?? this.extractTag(itemXml, 'published')
        ?? this.extractTag(itemXml, 'updated');

      if (!title) continue;

      items.push({
        externalJobId: this.extractTag(itemXml, 'guid')
          ?? this.extractTag(itemXml, 'id')
          ?? title,
        title,
        description: this.stripHtml(description ?? ''),
        companyName: '',
        companyLogo: undefined,
        location: undefined,
        city: undefined,
        country: undefined,
        workMode: 'ONSITE',
        jobType: 'FULL_TIME',
        experienceLevel: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        salaryCurrency: undefined,
        skills: [],
        applyUrl: link ?? '',
        postedAt: pubDate ? new Date(pubDate) : new Date(),
        expiresAt: undefined,
        rawData: { title, link, description, pubDate },
      });
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
    let match = xml.match(regex);
    if (match) return match[1].trim();

    const simpleRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    match = xml.match(simpleRegex);
    return match ? match[1].trim() : null;
  }

  private extractAttribute(xml: string, tag: string, attr: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }
}

// ─── HELPERS ──────────────────────────────────────────────

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

function getConnector(sourceType: FeedSourceType): FeedConnector {
  switch (sourceType) {
    case 'GREENHOUSE':
      return new GreenhouseConnector();
    case 'LEVER':
      return new LeverConnector();
    case 'REMOTIVE':
      return new RemotiveConnector();
    case 'ARBEITNOW':
      return new ArbeitnowConnector();
    case 'CUSTOM_API':
      return new GenericApiConnector();
    case 'RSS':
      return new RSSConnector();
    default:
      return new GenericApiConnector();
  }
}

function mapSourceToJobSource(sourceType: FeedSourceType): JobSource {
  switch (sourceType) {
    case 'GREENHOUSE':
      return 'GREENHOUSE';
    case 'LEVER':
      return 'LEVER';
    case 'REMOTIVE':
      return 'OTHER';
    case 'ARBEITNOW':
      return 'OTHER';
    default:
      return 'OTHER';
  }
}

// ─── CORE FUNCTIONS ───────────────────────────────────────

export async function fetchAndNormalizeJobs(
  source: FeedSourceRecord,
): Promise<NormalizedJob[]> {
  const connector = getConnector(source.sourceType);
  return connector.fetchJobs(source);
}

export async function syncFeedSource(sourceId: number): Promise<SyncResult> {
  const result: SyncResult = { fetched: 0, new: 0, updated: 0, duplicates: 0, expired: 0, errors: [] };

  const source = await prisma.jobFeedSource.findUnique({ where: { id: sourceId } });
  if (!source) {
    result.errors.push(`Feed source ${sourceId} not found`);
    return result;
  }

  const syncLog = await prisma.jobFeedSyncLog.create({
    data: {
      sourceId,
      status: 'RUNNING',
    },
  });

  try {
    const normalizedJobs = await fetchAndNormalizeJobs(source as any);
    result.fetched = normalizedJobs.length;

    const jobSource = mapSourceToJobSource(source.sourceType);

    // Track external IDs seen in this sync run
    const seenExternalIds = new Set<string>();

    // Get all existing jobs from this feed source for expiry tracking
    const existingJobs = await prisma.job.findMany({
      where: { feedSourceId: sourceId },
      select: { id: true, sourceJobId: true, title: true, location: true, companyId: true },
    });
    const existingByExternalId = new Map(
      existingJobs
        .filter((j) => j.sourceJobId)
        .map((j) => [j.sourceJobId!, j]),
    );

    for (const nj of normalizedJobs) {
      try {
        seenExternalIds.add(nj.externalJobId);

        // Primary dedup: feedSourceId + sourceJobId
        const existingBySourceJob = await prisma.job.findFirst({
          where: {
            feedSourceId: sourceId,
            sourceJobId: nj.externalJobId,
          },
        });

        if (existingBySourceJob) {
          // Always update to keep data fresh and mark as seen
          await prisma.job.update({
            where: { id: existingBySourceJob.id },
            data: {
              title: nj.title,
              description: nj.description,
              location: nj.location,
              city: nj.city,
              country: nj.country,
              workMode: nj.workMode,
              jobType: nj.jobType,
              experienceLevel: nj.experienceLevel,
              salaryMin: nj.salaryMin,
              salaryMax: nj.salaryMax,
              salaryCurrency: nj.salaryCurrency,
              skills: nj.skills,
              department: nj.department,
              externalApplyUrl: nj.applyUrl,
              rawData: nj.rawData ?? undefined,
              status: 'ACTIVE',
              lastSeenAt: new Date(),
            },
          });
          result.updated++;
          continue;
        }

        // Find or create company
        const company = await findOrCreateCompany(nj.companyName, nj.companyLogo);

        // Create job
        await prisma.job.create({
          data: {
            title: nj.title,
            description: nj.description,
            companyId: company.id,
            companyName: nj.companyName,
            location: nj.location,
            city: nj.city,
            country: nj.country,
            jobType: nj.jobType,
            workMode: nj.workMode,
            experienceLevel: nj.experienceLevel,
            salaryMin: nj.salaryMin,
            salaryMax: nj.salaryMax,
            salaryCurrency: nj.salaryCurrency,
            skills: nj.skills,
            department: nj.department,
            status: 'ACTIVE',
            source: jobSource,
            sourceType: source.sourceType,
            sourceJobId: nj.externalJobId,
            feedSourceId: sourceId,
            externalApplyUrl: nj.applyUrl,
            rawData: nj.rawData ?? undefined,
            postedAt: nj.postedAt,
            expiresAt: nj.expiresAt,
          },
        });

        result.new++;
      } catch (err: any) {
        const errorMsg = `Job ${nj.externalJobId}: ${err.message}`;
        result.errors.push(errorMsg);

        // Log error to JobFeedError
        try {
          await prisma.jobFeedError.create({
            data: {
              sourceId,
              jobId: nj.externalJobId,
              jobTitle: nj.title,
              errorMessage: err.message,
              errorData: { raw: err.stack },
              status: 'OPEN',
            },
          });
        } catch {
          // Swallow error logging failures
        }
      }
    }

    // Mark jobs not in current feed as EXPIRED
    const expiredResult = await prisma.job.updateMany({
      where: {
        feedSourceId: sourceId,
        status: 'ACTIVE',
        sourceJobId: { notIn: Array.from(seenExternalIds) },
      },
      data: { status: 'EXPIRED' },
    });
    result.expired = expiredResult.count;

    // Update sync log
    const finalStatus: SyncStatus = result.errors.length > 0 ? 'PARTIAL' : 'COMPLETED';

    await prisma.jobFeedSyncLog.update({
      where: { id: syncLog.id },
      data: {
        completedAt: new Date(),
        status: finalStatus,
        fetchedCount: result.fetched,
        newCount: result.new,
        updatedCount: result.updated,
        expiredCount: result.expired,
        duplicateCount: result.duplicates,
        errorCount: result.errors.length,
        errorDetails: result.errors.length > 0 ? result.errors.join('\n') : null,
      },
    });

    // Update feed source
    const totalJobs = await prisma.job.count({
      where: { feedSourceId: sourceId, status: 'ACTIVE' },
    });

    await prisma.jobFeedSource.update({
      where: { id: sourceId },
      data: {
        lastSyncAt: new Date(),
        totalJobs,
        syncErrorCount: result.errors.length > 0
          ? { increment: 1 }
          : { set: 0 },
      },
    });
  } catch (err: any) {
    result.errors.push(`Sync failed: ${err.message}`);

    await prisma.jobFeedSyncLog.update({
      where: { id: syncLog.id },
      data: {
        completedAt: new Date(),
        status: 'FAILED',
        fetchedCount: result.fetched,
        newCount: result.new,
        updatedCount: result.updated,
        expiredCount: result.expired,
        duplicateCount: result.duplicates,
        errorCount: result.errors.length,
        errorDetails: result.errors.join('\n'),
      },
    });

    await prisma.jobFeedSource.update({
      where: { id: sourceId },
      data: { syncErrorCount: { increment: 1 } },
    });
  }

  return result;
}

export async function findOrCreateCompany(
  name: string,
  logo?: string,
) {
  const normalizedName = name.trim();

  const existing = await prisma.company.findFirst({
    where: { name: { equals: normalizedName, mode: 'insensitive' } },
  });

  if (existing) return existing;

  return prisma.company.create({
    data: {
      name: normalizedName,
      logo: logo ?? undefined,
      verificationStatus: 'PENDING',
    },
  });
}

export function createJobFromNormalized(
  normalized: NormalizedJob,
  sourceId: number,
  companyId: number,
  sourceType: FeedSourceType,
) {
  const jobSource = mapSourceToJobSource(sourceType);

  return prisma.job.create({
    data: {
      title: normalized.title,
      description: normalized.description,
      companyId,
      companyName: normalized.companyName,
      location: normalized.location,
      city: normalized.city,
      country: normalized.country,
      jobType: normalized.jobType,
      workMode: normalized.workMode,
      experienceLevel: normalized.experienceLevel,
      salaryMin: normalized.salaryMin,
      salaryMax: normalized.salaryMax,
      salaryCurrency: normalized.salaryCurrency,
      skills: normalized.skills,
      department: normalized.department,
      status: 'ACTIVE',
      source: jobSource,
      sourceType,
      sourceJobId: normalized.externalJobId,
      feedSourceId: sourceId,
      externalApplyUrl: normalized.applyUrl,
      rawData: normalized.rawData ?? undefined,
      postedAt: normalized.postedAt,
      expiresAt: normalized.expiresAt,
    },
  });
}
