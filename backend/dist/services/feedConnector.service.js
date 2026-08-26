"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndNormalizeJobs = fetchAndNormalizeJobs;
exports.syncFeedSource = syncFeedSource;
exports.findOrCreateCompany = findOrCreateCompany;
exports.createJobFromNormalized = createJobFromNormalized;
const prisma_1 = __importDefault(require("../utils/prisma"));
const crypto_1 = require("../utils/crypto");
function getAuthHeaders(source) {
    const headers = {};
    let credentials = null;
    if (source.credentialsRef) {
        try {
            credentials = (0, crypto_1.decrypt)(source.credentialsRef);
        }
        catch {
            // If decryption fails, proceed without credentials
        }
    }
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
    return headers;
}
// ─── CONNECTORS ───────────────────────────────────────────
class GreenhouseConnector {
    async fetchJobs(source) {
        // Use endpoint as-is; user provides full URL including ?content=true
        const url = source.endpoint;
        const headers = getAuthHeaders(source);
        const res = await fetch(url, { headers });
        if (!res.ok) {
            throw new Error(`Greenhouse API returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const jobs = data.jobs ?? [];
        return jobs.map((job) => this.normalizeJob(job, source.name));
    }
    normalizeJob(job, companyName) {
        const locationName = job.location?.name ?? '';
        const workMode = this.inferWorkMode(locationName);
        const departments = (job.departments ?? []).map((d) => d.name);
        return {
            externalJobId: String(job.id),
            title: job.title ?? '',
            description: job.description ?? '',
            companyName,
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
            applyUrl: job.absolute_url
                ? `https://boards.greenhouse.io${job.absolute_url}`
                : '',
            postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
            expiresAt: undefined,
        };
    }
    inferWorkMode(location) {
        const lower = location.toLowerCase();
        if (lower.includes('remote'))
            return 'REMOTE';
        if (lower.includes('hybrid'))
            return 'HYBRID';
        return 'ONSITE';
    }
    extractCity(location) {
        const parts = location.split(',').map((p) => p.trim());
        return parts[0] || undefined;
    }
    extractCountry(location) {
        const parts = location.split(',').map((p) => p.trim());
        return parts[parts.length - 1] || undefined;
    }
}
class LeverConnector {
    async fetchJobs(source) {
        const headers = getAuthHeaders(source);
        const res = await fetch(source.endpoint, { headers });
        if (!res.ok) {
            throw new Error(`Lever API returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : data.data ?? [];
        return jobs.map((job) => this.normalizeJob(job, source.name));
    }
    normalizeJob(job, companyName) {
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
            applyUrl: job.hostedUrl ?? job.applyUrl ?? '',
            postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
            expiresAt: undefined,
        };
    }
    inferWorkMode(location, commitment) {
        const lower = location.toLowerCase();
        const commitLower = (commitment ?? '').toLowerCase();
        if (lower.includes('remote') || commitLower.includes('remote'))
            return 'REMOTE';
        if (lower.includes('hybrid') || commitLower.includes('hybrid'))
            return 'HYBRID';
        return 'ONSITE';
    }
    mapCommitment(commitment) {
        const lower = (commitment ?? '').toLowerCase();
        if (lower.includes('part'))
            return 'PART_TIME';
        if (lower.includes('contract'))
            return 'CONTRACT';
        if (lower.includes('intern'))
            return 'INTERNSHIP';
        return 'FULL_TIME';
    }
}
class RemotiveConnector {
    async fetchJobs(source) {
        const headers = getAuthHeaders(source);
        const res = await fetch(source.endpoint, { headers });
        if (!res.ok) {
            throw new Error(`Remotive API returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const jobs = data.jobs ?? data ?? [];
        return jobs.map((job) => this.normalizeJob(job));
    }
    normalizeJob(job) {
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
        };
    }
}
class ArbeitnowConnector {
    async fetchJobs(source) {
        const headers = getAuthHeaders(source);
        const res = await fetch(source.endpoint, { headers });
        if (!res.ok) {
            throw new Error(`Arbeitnow API returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const jobs = data.data ?? data ?? [];
        return jobs.map((job) => this.normalizeJob(job));
    }
    normalizeJob(job) {
        const locationStr = job.location ?? '';
        const workModeStr = (job.remote ?? '').toString().toLowerCase();
        const workMode = workModeStr === 'true' || workModeStr === 'yes' ? 'REMOTE' : 'ONSITE';
        const jobTypeStr = (job.job_type ?? job.jobType ?? 'FULL_TIME').toString().toUpperCase().replace(/\s+/g, '_');
        let jobType = 'FULL_TIME';
        if (jobTypeStr === 'PART_TIME')
            jobType = 'PART_TIME';
        else if (jobTypeStr === 'CONTRACT')
            jobType = 'CONTRACT';
        else if (jobTypeStr === 'INTERNSHIP')
            jobType = 'INTERNSHIP';
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
        };
    }
}
class GenericApiConnector {
    async fetchJobs(source) {
        const headers = getAuthHeaders(source);
        const res = await fetch(source.endpoint, { headers });
        if (!res.ok) {
            throw new Error(`Generic API returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.jobs ?? data.data ?? data.results ?? [];
        return items.map((item) => this.normalizeItem(item));
    }
    normalizeItem(item) {
        const locationStr = item.location ?? item.location_name ?? item.locationName ?? '';
        const workModeStr = (item.work_mode ?? item.workMode ?? item.remote ?? '').toString().toUpperCase();
        let workMode = 'ONSITE';
        if (workModeStr === 'REMOTE')
            workMode = 'REMOTE';
        else if (workModeStr === 'HYBRID')
            workMode = 'HYBRID';
        const jobTypeStr = (item.job_type ?? item.jobType ?? item.employment_type ?? 'FULL_TIME').toString().toUpperCase().replace(/\s+/g, '_');
        let jobType = 'FULL_TIME';
        if (jobTypeStr === 'PART_TIME')
            jobType = 'PART_TIME';
        else if (jobTypeStr === 'CONTRACT')
            jobType = 'CONTRACT';
        else if (jobTypeStr === 'INTERNSHIP')
            jobType = 'INTERNSHIP';
        const skillsRaw = item.skills ?? item.tags ?? item.technologies ?? [];
        const skills = Array.isArray(skillsRaw) ? skillsRaw.map(String) : [];
        return {
            externalJobId: String(item.id ?? item.job_id ?? item.jobId ?? item.external_id ?? ''),
            title: item.title ?? item.job_title ?? item.jobTitle ?? item.name ?? '',
            description: item.description ?? item.summary ?? item.body ?? '',
            companyName: item.company ?? item.company_name ?? item.companyName ?? item.organization ?? '',
            companyLogo: item.company_logo ?? item.companyLogo ?? item.logo ?? undefined,
            location: locationStr || undefined,
            city: (item.city ?? undefined),
            country: (item.country ?? undefined),
            workMode,
            jobType,
            experienceLevel: item.experience_level ?? item.experienceLevel ?? item.seniority ?? undefined,
            salaryMin: item.salary_min ?? item.salaryMin ?? item.salary_min_amount ?? undefined,
            salaryMax: item.salary_max ?? item.salaryMax ?? item.salary_max_amount ?? undefined,
            salaryCurrency: item.salary_currency ?? item.salaryCurrency ?? item.currency ?? undefined,
            skills,
            applyUrl: item.apply_url ?? item.applyUrl ?? item.url ?? item.link ?? item.application_url ?? '',
            postedAt: item.posted_at ?? item.postedAt ?? item.published_at ?? item.created_at ?? new Date(),
            expiresAt: item.expires_at ?? item.expiresAt ?? item.deadline ?? undefined,
        };
    }
}
class RSSConnector {
    async fetchJobs(source) {
        const headers = getAuthHeaders(source);
        const res = await fetch(source.endpoint, { headers });
        if (!res.ok) {
            throw new Error(`RSS feed returned ${res.status}: ${res.statusText}`);
        }
        const text = await res.text();
        return this.parseRSS(text);
    }
    parseRSS(xml) {
        const items = [];
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
            if (!title)
                continue;
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
            });
        }
        return items;
    }
    extractTag(xml, tag) {
        const regex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
        let match = xml.match(regex);
        if (match)
            return match[1].trim();
        const simpleRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
        match = xml.match(simpleRegex);
        return match ? match[1].trim() : null;
    }
    extractAttribute(xml, tag, attr) {
        const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : null;
    }
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').trim();
    }
}
// ─── HELPERS ──────────────────────────────────────────────
function normalizeString(s) {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ');
}
function getConnector(sourceType) {
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
function mapSourceToJobSource(sourceType) {
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
async function fetchAndNormalizeJobs(source) {
    const connector = getConnector(source.sourceType);
    return connector.fetchJobs(source);
}
async function syncFeedSource(sourceId) {
    const result = { fetched: 0, new: 0, updated: 0, duplicates: 0, expired: 0, errors: [] };
    const source = await prisma_1.default.jobFeedSource.findUnique({ where: { id: sourceId } });
    if (!source) {
        result.errors.push(`Feed source ${sourceId} not found`);
        return result;
    }
    const syncLog = await prisma_1.default.jobFeedSyncLog.create({
        data: {
            sourceId,
            status: 'RUNNING',
        },
    });
    try {
        const normalizedJobs = await fetchAndNormalizeJobs(source);
        result.fetched = normalizedJobs.length;
        const jobSource = mapSourceToJobSource(source.sourceType);
        // Track external IDs seen in this sync run
        const seenExternalIds = new Set();
        // Get all existing jobs from this feed source for expiry tracking
        const existingJobs = await prisma_1.default.job.findMany({
            where: { feedSourceId: sourceId },
            select: { id: true, sourceJobId: true, title: true, location: true, companyId: true },
        });
        const existingByExternalId = new Map(existingJobs
            .filter((j) => j.sourceJobId)
            .map((j) => [j.sourceJobId, j]));
        for (const nj of normalizedJobs) {
            try {
                seenExternalIds.add(nj.externalJobId);
                // Primary dedup: source + sourceJobId
                const existingBySourceJob = await prisma_1.default.job.findUnique({
                    where: { source_sourceJobId: { source: jobSource, sourceJobId: nj.externalJobId } },
                });
                if (existingBySourceJob) {
                    // Update if changed
                    const hasChanged = existingBySourceJob.title !== nj.title ||
                        existingBySourceJob.description !== nj.description ||
                        existingBySourceJob.location !== nj.location;
                    if (hasChanged) {
                        await prisma_1.default.job.update({
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
                                externalApplyUrl: nj.applyUrl,
                                status: 'ACTIVE',
                            },
                        });
                        result.updated++;
                    }
                    else {
                        result.duplicates++;
                    }
                    continue;
                }
                // Fallback dedup: normalized company + title + location
                const normalizedCompany = normalizeString(nj.companyName);
                const normalizedTitle = normalizeString(nj.title);
                const normalizedLocation = normalizeString(nj.location ?? '');
                const crossDuplicate = await prisma_1.default.job.findFirst({
                    where: {
                        AND: [
                            { companyName: { contains: nj.companyName, mode: 'insensitive' } },
                            { title: { contains: nj.title, mode: 'insensitive' } },
                        ],
                    },
                });
                if (crossDuplicate) {
                    // Check if the normalized values actually match
                    const existingNormCompany = normalizeString(crossDuplicate.companyName ?? '');
                    const existingNormTitle = normalizeString(crossDuplicate.title);
                    const existingNormLocation = normalizeString(crossDuplicate.location ?? '');
                    if (existingNormCompany === normalizedCompany &&
                        existingNormTitle === normalizedTitle &&
                        existingNormLocation === normalizedLocation) {
                        result.duplicates++;
                        continue;
                    }
                }
                // Find or create company
                const company = await findOrCreateCompany(nj.companyName, nj.companyLogo);
                // Create job
                await prisma_1.default.job.create({
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
                        status: 'ACTIVE',
                        source: jobSource,
                        sourceType: source.sourceType,
                        sourceJobId: nj.externalJobId,
                        feedSourceId: sourceId,
                        externalApplyUrl: nj.applyUrl,
                        postedAt: nj.postedAt,
                        expiresAt: nj.expiresAt,
                    },
                });
                result.new++;
            }
            catch (err) {
                const errorMsg = `Job ${nj.externalJobId}: ${err.message}`;
                result.errors.push(errorMsg);
                // Log error to JobFeedError
                try {
                    await prisma_1.default.jobFeedError.create({
                        data: {
                            sourceId,
                            jobId: nj.externalJobId,
                            jobTitle: nj.title,
                            errorMessage: err.message,
                            errorData: { raw: err.stack },
                            status: 'OPEN',
                        },
                    });
                }
                catch {
                    // Swallow error logging failures
                }
            }
        }
        // Mark jobs not in current feed as EXPIRED
        const expiredResult = await prisma_1.default.job.updateMany({
            where: {
                feedSourceId: sourceId,
                status: 'ACTIVE',
                sourceJobId: { notIn: Array.from(seenExternalIds) },
            },
            data: { status: 'EXPIRED' },
        });
        result.expired = expiredResult.count;
        // Update sync log
        const finalStatus = result.errors.length > 0 ? 'PARTIAL' : 'COMPLETED';
        await prisma_1.default.jobFeedSyncLog.update({
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
        const totalJobs = await prisma_1.default.job.count({
            where: { feedSourceId: sourceId, status: 'ACTIVE' },
        });
        await prisma_1.default.jobFeedSource.update({
            where: { id: sourceId },
            data: {
                lastSyncAt: new Date(),
                totalJobs,
                syncErrorCount: result.errors.length > 0
                    ? { increment: 1 }
                    : { set: 0 },
            },
        });
    }
    catch (err) {
        result.errors.push(`Sync failed: ${err.message}`);
        await prisma_1.default.jobFeedSyncLog.update({
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
        await prisma_1.default.jobFeedSource.update({
            where: { id: sourceId },
            data: { syncErrorCount: { increment: 1 } },
        });
    }
    return result;
}
async function findOrCreateCompany(name, logo) {
    const normalizedName = name.trim();
    const existing = await prisma_1.default.company.findFirst({
        where: { name: { equals: normalizedName, mode: 'insensitive' } },
    });
    if (existing)
        return existing;
    return prisma_1.default.company.create({
        data: {
            name: normalizedName,
            logo: logo ?? undefined,
            verificationStatus: 'PENDING',
        },
    });
}
function createJobFromNormalized(normalized, sourceId, companyId, sourceType) {
    const jobSource = mapSourceToJobSource(sourceType);
    return prisma_1.default.job.create({
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
            status: 'ACTIVE',
            source: jobSource,
            sourceType,
            sourceJobId: normalized.externalJobId,
            feedSourceId: sourceId,
            externalApplyUrl: normalized.applyUrl,
            postedAt: normalized.postedAt,
            expiresAt: normalized.expiresAt,
        },
    });
}
