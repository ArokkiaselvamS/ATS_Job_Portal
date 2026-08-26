import { Router } from 'express';
import multer from 'multer';
import { registerCompany, getMyCompany } from '../../controllers/company/company.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, SVG, and WebP are allowed.'));
    }
  },
});

// Make logo field optional - use fields() with optional logo
const optionalUpload = upload.fields([{ name: 'logo', maxCount: 1 }]);

router.post('/register', optionalUpload, registerCompany);
router.get('/me', requireAuth, getMyCompany);

export default router;