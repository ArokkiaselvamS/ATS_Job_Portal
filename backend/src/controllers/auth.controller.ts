import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { 
  createAndSendRegistrationOtp, 
  verifyRegistrationOtp as verifyOtpService, 
  resendRegistrationOtp as resendOtpService 
} from '../services/otp.service';

function generateReferralCode(firstName: string, lastName: string, userId: number): string {
  const base = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  return `${base}${String(userId).padStart(4, '0')}`;
}

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const sendRegistrationOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(data.password);

    const result = await createAndSendRegistrationOtp({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashedPassword,
      phone: data.phone,
    });

    if (!result.success) {
      res.status(429).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
});

export const verifyRegistrationOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);

    const verifyResult = verifyOtpService(email, otp);
    if (!verifyResult.success || !verifyResult.data) {
      res.status(400).json({ success: false, message: verifyResult.message });
      return;
    }

    const pending = verifyResult.data;

    // Double check email hasn't been taken in the meantime
    const existing = await prisma.user.findUnique({ where: { email: pending.email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        firstName: pending.firstName,
        lastName: pending.lastName,
        email: pending.email,
        passwordHash: pending.passwordHash,
        phone: pending.phone,
        role: 'JOB_SEEKER',
        isEmailVerified: true,
        referralCode: '',
        profile: {
          create: {},
        },
      },
    });

    const referralCode = generateReferralCode(pending.firstName, pending.lastName, user.id);
    await prisma.user.update({ where: { id: user.id }, data: { referralCode } });

    const token = generateToken({ userId: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration and email verification successful!',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const resendRegistrationOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = resendOtpSchema.parse(req.body);
    const result = await resendOtpService(email);
    if (!result.success) {
      res.status(429).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: hashedPassword,
        phone: data.phone,
        role: 'JOB_SEEKER',
        referralCode: '',
        profile: {
          create: {},
        },
      },
    });

    const referralCode = generateReferralCode(data.firstName, data.lastName, user.id);
    await prisma.user.update({ where: { id: user.id }, data: { referralCode } });

    const token = generateToken({ userId: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await verifyPassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Logout successful' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileImage: true,
        referralCode: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const firebaseLoginSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  photoURL: z.string().optional(),
  firebaseUid: z.string().optional(),
});

export const firebaseLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = firebaseLoginSchema.parse(req.body);
    const firstName = data.firstName || 'User';
    const lastName = data.lastName || '';

    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      const randomPassword = await hashPassword(Math.random().toString(36).substring(2) + 'Aa1@!');
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: data.email,
          passwordHash: randomPassword,
          profileImage: data.photoURL,
          role: 'JOB_SEEKER',
          isEmailVerified: true,
          referralCode: '',
          profile: {
            create: {},
          },
        },
      });

      const referralCode = generateReferralCode(firstName, lastName || firstName, user.id);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode },
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Firebase login successful',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};
