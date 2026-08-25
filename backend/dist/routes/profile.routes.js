"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const profile_controller_1 = require("../controllers/profile.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// Profile
router.get('/', profile_controller_1.getProfile);
router.put('/', profile_controller_1.updateProfile);
// Resume
router.post('/resume', profile_controller_1.uploadResume, profile_controller_1.uploadResumeFile);
// ATS
router.get('/ats-score', profile_controller_1.getATSScore);
router.get('/completion', profile_controller_1.getProfileCompletion);
// Education
router.get('/education', profile_controller_1.getEducation);
router.post('/education', profile_controller_1.upsertEducation);
router.put('/education', profile_controller_1.upsertEducation);
router.delete('/education/:id', profile_controller_1.deleteEducation);
// Experience
router.get('/experience', profile_controller_1.getExperience);
router.post('/experience', profile_controller_1.upsertExperience);
router.put('/experience', profile_controller_1.upsertExperience);
router.delete('/experience/:id', profile_controller_1.deleteExperience);
// Skills
router.get('/skills', profile_controller_1.getSkills);
router.post('/skills', profile_controller_1.upsertSkill);
router.put('/skills', profile_controller_1.upsertSkill);
router.delete('/skills/:id', profile_controller_1.deleteSkill);
// Projects
router.get('/projects', profile_controller_1.getProjects);
router.post('/projects', profile_controller_1.upsertProject);
router.put('/projects', profile_controller_1.upsertProject);
router.delete('/projects/:id', profile_controller_1.deleteProject);
// Certifications
router.get('/certifications', profile_controller_1.getCertifications);
router.post('/certifications', profile_controller_1.upsertCertification);
router.put('/certifications', profile_controller_1.upsertCertification);
router.delete('/certifications/:id', profile_controller_1.deleteCertification);
// Achievements
router.get('/achievements', profile_controller_1.getAchievements);
router.post('/achievements', profile_controller_1.upsertAchievement);
router.put('/achievements', profile_controller_1.upsertAchievement);
router.delete('/achievements/:id', profile_controller_1.deleteAchievement);
// Languages
router.get('/languages', profile_controller_1.getLanguages);
router.post('/languages', profile_controller_1.upsertLanguage);
router.put('/languages', profile_controller_1.upsertLanguage);
router.delete('/languages/:id', profile_controller_1.deleteLanguage);
exports.default = router;
