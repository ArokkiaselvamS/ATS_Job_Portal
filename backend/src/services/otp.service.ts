import crypto from 'crypto';
import { sendOtpEmail } from './email.service';
import { sendOtpSms } from './sms.service';

interface PendingRegistration {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  otp: string;
  expiresAt: number; // timestamp
  attempts: number;
  lastSentAt: number;
}

// In-memory OTP registry
const pendingStore = new Map<string, PendingRegistration>();

// Auto-cleanup expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of pendingStore.entries()) {
    if (record.expiresAt < now) {
      pendingStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

export async function createAndSendRegistrationOtp(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }
): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  const emailKey = payload.email.toLowerCase().trim();
  const existing = pendingStore.get(emailKey);
  const now = Date.now();

  // 60-second rate limiting on sending OTP
  if (existing && now - existing.lastSentAt < 60 * 1000) {
    const remaining = Math.ceil((60 * 1000 - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${remaining} seconds before requesting a new OTP.`,
      cooldownSeconds: remaining,
    };
  }

  // Generate 6-digit cryptographic numeric OTP
  const otp = String(crypto.randomInt(100000, 999999));
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  pendingStore.set(emailKey, {
    ...payload,
    email: emailKey,
    otp,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
  });

  // Dispatch simultaneously to Email and Mobile SMS
  await Promise.allSettled([
    sendOtpEmail(emailKey, otp, payload.firstName),
    payload.phone ? sendOtpSms(payload.phone, otp) : Promise.resolve(),
  ]);

  return {
    success: true,
    message: payload.phone 
      ? `Verification code sent to your email and mobile number`
      : `Verification code sent to ${emailKey}`,
  };
}

export async function resendRegistrationOtp(
  email: string
): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  const emailKey = email.toLowerCase().trim();
  const existing = pendingStore.get(emailKey);
  const now = Date.now();

  if (!existing) {
    return {
      success: false,
      message: 'No pending registration found for this email. Please fill out the registration form again.',
    };
  }

  if (now - existing.lastSentAt < 60 * 1000) {
    const remaining = Math.ceil((60 * 1000 - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${remaining} seconds before requesting another code.`,
      cooldownSeconds: remaining,
    };
  }

  const otp = String(crypto.randomInt(100000, 999999));
  existing.otp = otp;
  existing.expiresAt = now + 10 * 60 * 1000;
  existing.lastSentAt = now;
  existing.attempts = 0;

  await Promise.allSettled([
    sendOtpEmail(emailKey, otp, existing.firstName),
    existing.phone ? sendOtpSms(existing.phone, otp) : Promise.resolve(),
  ]);

  return {
    success: true,
    message: existing.phone 
      ? `A new verification code has been sent to your email and mobile number`
      : `A new verification code has been sent to ${emailKey}`,
  };
}

export function verifyRegistrationOtp(
  email: string,
  providedOtp: string
): { success: boolean; message: string; data?: PendingRegistration } {
  const emailKey = email.toLowerCase().trim();
  const existing = pendingStore.get(emailKey);
  const now = Date.now();

  if (!existing) {
    return {
      success: false,
      message: 'No pending registration session found. Please register again.',
    };
  }

  if (existing.expiresAt < now) {
    pendingStore.delete(emailKey);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new OTP.',
    };
  }

  if (existing.attempts >= 5) {
    pendingStore.delete(emailKey);
    return {
      success: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  const cleanProvided = String(providedOtp).trim();
  if (existing.otp !== cleanProvided) {
    existing.attempts += 1;
    const remainingAttempts = 5 - existing.attempts;
    return {
      success: false,
      message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
    };
  }

  // OTP verified successfully — consume and return registration data
  pendingStore.delete(emailKey);
  return {
    success: true,
    message: 'OTP verified successfully.',
    data: existing,
  };
}
