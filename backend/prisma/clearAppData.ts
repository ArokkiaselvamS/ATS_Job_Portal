/**
 * Clears all application data from the database while preserving:
 * - User accounts (login credentials)
 * - Database schema / enums
 * 
 * Usage: npx tsx prisma/clearAppData.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting application data cleanup...\n');

  // Delete in order to respect foreign key constraints
  // Start with tables that have no dependencies on other app data

  // 1. Resume (depends on Profile)
  const resumes = await prisma.resume.deleteMany();
  console.log(`  Cleared Resume: ${resumes.count} rows`);

  // 2. Profile sub-tables (depend on Profile)
  const educations = await prisma.education.deleteMany();
  console.log(`  Cleared Education: ${educations.count} rows`);

  const experiences = await prisma.experience.deleteMany();
  console.log(`  Cleared Experience: ${experiences.count} rows`);

  const skillEntries = await prisma.skillEntry.deleteMany();
  console.log(`  Cleared SkillEntry: ${skillEntries.count} rows`);

  const projects = await prisma.project.deleteMany();
  console.log(`  Cleared Project: ${projects.count} rows`);

  const certifications = await prisma.certification.deleteMany();
  console.log(`  Cleared Certification: ${certifications.count} rows`);

  const achievements = await prisma.achievement.deleteMany();
  console.log(`  Cleared Achievement: ${achievements.count} rows`);

  const languages = await prisma.language.deleteMany();
  console.log(`  Cleared Language: ${languages.count} rows`);

  // 3. Profile
  const profiles = await prisma.profile.deleteMany();
  console.log(`  Cleared Profile: ${profiles.count} rows`);

  // 4. Application & SavedJob (depend on User and Job)
  const applications = await prisma.application.deleteMany();
  console.log(`  Cleared Application: ${applications.count} rows`);

  const savedJobs = await prisma.savedJob.deleteMany();
  console.log(`  Cleared SavedJob: ${savedJobs.count} rows`);

  // 5. Invitation (depends on User)
  const invitations = await prisma.invitation.deleteMany();
  console.log(`  Cleared Invitation: ${invitations.count} rows`);

  // 6. AuditLog (depends on User)
  const auditLogs = await prisma.auditLog.deleteMany();
  console.log(`  Cleared AuditLog: ${auditLogs.count} rows`);

  // 7. Notification (depends on User)
  const notifications = await prisma.notification.deleteMany();
  console.log(`  Cleared Notification: ${notifications.count} rows`);

  // 8. JobFeedError (depends on JobFeedSource)
  const feedErrors = await prisma.jobFeedError.deleteMany();
  console.log(`  Cleared JobFeedError: ${feedErrors.count} rows`);

  // 9. JobFeedSyncLog (depends on JobFeedSource)
  const feedSyncLogs = await prisma.jobFeedSyncLog.deleteMany();
  console.log(`  Cleared JobFeedSyncLog: ${feedSyncLogs.count} rows`);

  // 10. JobFeedSource
  const feedSources = await prisma.jobFeedSource.deleteMany();
  console.log(`  Cleared JobFeedSource: ${feedSources.count} rows`);

  // 11. Job (depends on Company, Category, JobFeedSource)
  const jobs = await prisma.job.deleteMany();
  console.log(`  Cleared Job: ${jobs.count} rows`);

  // 12. CompanyAdmin (depends on User and Company)
  const companyAdmins = await prisma.companyAdmin.deleteMany();
  console.log(`  Cleared CompanyAdmin: ${companyAdmins.count} rows`);

  // 13. PlatformReport (depends on Company)
  const reports = await prisma.platformReport.deleteMany();
  console.log(`  Cleared PlatformReport: ${reports.count} rows`);

  // 14. Company
  const companies = await prisma.company.deleteMany();
  console.log(`  Cleared Company: ${companies.count} rows`);

  // 15. Skill (depends on Category)
  const skills = await prisma.skill.deleteMany();
  console.log(`  Cleared Skill: ${skills.count} rows`);

  // 16. Category
  const categories = await prisma.category.deleteMany();
  console.log(`  Cleared Category: ${categories.count} rows`);

  // 17. PlatformSetting
  const settings = await prisma.platformSetting.deleteMany();
  console.log(`  Cleared PlatformSetting: ${settings.count} rows`);

  // Verify User table is untouched
  const userCount = await prisma.user.count();
  console.log(`\n  User accounts preserved: ${userCount} users`);

  console.log('\nCleanup complete. All application data cleared. Login credentials intact.');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
