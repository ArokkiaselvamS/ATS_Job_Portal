import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  uploadResumeFile,
  uploadResume,
  getATSScore,
  getProfileCompletion,
  getEducation,
  upsertEducation,
  deleteEducation,
  getExperience,
  upsertExperience,
  deleteExperience,
  getSkills,
  upsertSkill,
  deleteSkill,
  getProjects,
  upsertProject,
  deleteProject,
  getCertifications,
  upsertCertification,
  deleteCertification,
  getAchievements,
  upsertAchievement,
  deleteAchievement,
  getLanguages,
  upsertLanguage,
  deleteLanguage,
} from '../controllers/profile.controller';

const router = Router();

router.use(requireAuth);

// Profile
router.get('/', getProfile);
router.put('/', updateProfile);

// Resume
router.post('/resume', uploadResume, uploadResumeFile);

// ATS
router.get('/ats-score', getATSScore);
router.get('/completion', getProfileCompletion);

// Education
router.get('/education', getEducation);
router.post('/education', upsertEducation);
router.put('/education', upsertEducation);
router.delete('/education/:id', deleteEducation);

// Experience
router.get('/experience', getExperience);
router.post('/experience', upsertExperience);
router.put('/experience', upsertExperience);
router.delete('/experience/:id', deleteExperience);

// Skills
router.get('/skills', getSkills);
router.post('/skills', upsertSkill);
router.put('/skills', upsertSkill);
router.delete('/skills/:id', deleteSkill);

// Projects
router.get('/projects', getProjects);
router.post('/projects', upsertProject);
router.put('/projects', upsertProject);
router.delete('/projects/:id', deleteProject);

// Certifications
router.get('/certifications', getCertifications);
router.post('/certifications', upsertCertification);
router.put('/certifications', upsertCertification);
router.delete('/certifications/:id', deleteCertification);

// Achievements
router.get('/achievements', getAchievements);
router.post('/achievements', upsertAchievement);
router.put('/achievements', upsertAchievement);
router.delete('/achievements/:id', deleteAchievement);

// Languages
router.get('/languages', getLanguages);
router.post('/languages', upsertLanguage);
router.put('/languages', upsertLanguage);
router.delete('/languages/:id', deleteLanguage);

export default router;
