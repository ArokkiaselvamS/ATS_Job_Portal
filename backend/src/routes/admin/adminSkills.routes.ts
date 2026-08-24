import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import { getSkills, createSkill, updateSkill, mergeSkills } from '../../controllers/admin/adminSkills.controller';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

router.get('/', getSkills);
router.post('/', createSkill);
router.patch('/:id', updateSkill);
router.post('/merge', mergeSkills);

export default router;
