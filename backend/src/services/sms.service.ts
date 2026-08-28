import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function getEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!.trim();

  // Fallback: parse .env directly from backend folder
  try {
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(__dirname, '../../../backend/.env'),
    ];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const parsed = dotenv.parse(fs.readFileSync(p, 'utf-8'));
        if (parsed[key]) {
          process.env[key] = parsed[key].trim();
          return parsed[key].trim();
        }
      }
    }
  } catch (_) {}
  return '';
}

export async function sendOtpSms(phoneNumber: string, otp: string): Promise<boolean> {
  if (!phoneNumber) return false;

  // Clean and format phone number (strip whitespace, hyphens, parentheses)
  let cleanPhone = phoneNumber.replace(/[\s\-()]/g, '').trim();
  if (cleanPhone.startsWith('00')) {
    cleanPhone = '+' + cleanPhone.slice(2);
  } else if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.slice(1);
  }

  if (!cleanPhone.startsWith('+')) {
    // Default to +91 (India) for 10-digit numbers, or prepend +
    cleanPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
  }

  const message = `Your AESCION verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

  // 1. Check for Twilio Credentials
  const twilioSid = getEnvValue('TWILIO_ACCOUNT_SID');
  const twilioToken = getEnvValue('TWILIO_AUTH_TOKEN');
  const twilioVerifySid = getEnvValue('TWILIO_VERIFY_SERVICE_SID');
  const twilioFrom = getEnvValue('TWILIO_PHONE_NUMBER');

  // 1a. If Twilio Verify Service is configured (Works on Trial accounts with pre-approved templates)
  if (twilioSid && twilioToken && twilioVerifySid) {
    try {
      console.log(`📱 [TWILIO VERIFY] Sending OTP via Verify Service (${twilioVerifySid}) to ${cleanPhone}...`);
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams({
        To: cleanPhone,
        Channel: 'sms',
        CustomCode: otp,
      });

      const res = await fetch(`https://verify.twilio.com/v2/Services/${twilioVerifySid}/Verifications`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`✅ [SMS DELIVERED] Twilio Verify successfully sent OTP to: ${cleanPhone} (SID: ${data?.sid || 'N/A'})`);
        return true;
      } else {
        console.error(`❌ [SMS DELIVERY FAILED] Twilio Verify error (HTTP ${res.status}):`, data);
        if (data?.code === 60226) {
          console.warn(`⚠️ [TWILIO HINT] "Custom Verification Code" is not enabled on your Verify Service in Twilio Console. Please go to Verify > Services > General Settings and enable "Custom Verification Code".`);
        }
      }
    } catch (error) {
      console.error(`❌ [SMS DELIVERY FAILED] Network error with Twilio Verify:`, error);
    }
  }

  // 1b. Standard Twilio Programmable Messaging (For upgraded/paid Twilio accounts or direct SMS)
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      console.log(`📱 [TWILIO SMS] Sending OTP SMS to ${cleanPhone} from ${twilioFrom}...`);
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams({
        To: cleanPhone,
        From: twilioFrom,
        Body: message,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        console.log(`✅ [SMS DELIVERED] Twilio SMS successfully sent to: ${cleanPhone} (SID: ${data?.sid || 'N/A'})`);
        return true;
      } else {
        console.error(`❌ [SMS DELIVERY FAILED] Twilio error (HTTP ${res.status}):`, data);
        if (data?.code === 572006) {
          console.warn(`⚠️ [TWILIO HINT] Error 572006 indicates a Twilio Trial account restriction on custom SMS text. Either create a Twilio Verify Service (set TWILIO_VERIFY_SERVICE_SID) or upgrade your Twilio account to paid.`);
        }
        return false;
      }
    } catch (error) {
      console.error(`❌ [SMS DELIVERY FAILED] Network error sending Twilio SMS:`, error);
      return false;
    }
  }

  // 2. Check for Fast2SMS / Generic SMS Gateway fallback
  const fast2smsApiKey = process.env.FAST2SMS_API_KEY?.trim();
  if (fast2smsApiKey) {
    try {
      console.log(`📱 [FAST2SMS] Sending OTP SMS to: ${cleanPhone}...`);
      const rawNumbers = cleanPhone.replace(/^\+91/, '').replace(/^\+/, '');
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: rawNumbers,
        }),
      });
      if (res.ok) {
        console.log(`✅ [SMS DELIVERED] Fast2SMS successfully sent to: ${cleanPhone}`);
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error(`❌ [SMS DELIVERY FAILED] Fast2SMS error:`, errData);
      }
    } catch (error) {
      console.error(`❌ [SMS DELIVERY FAILED] Fast2SMS network error:`, error);
    }
  }

  return false;
}
