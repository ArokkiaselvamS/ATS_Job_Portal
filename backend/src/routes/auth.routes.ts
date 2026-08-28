import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  firebaseLogin,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtp);
router.post('/login', login);
router.post('/firebase-login', firebaseLogin);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
