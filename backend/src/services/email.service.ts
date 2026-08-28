import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER?.trim();
  // Strip spaces from Google App Passwords automatically
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '').trim();

  if (user && pass) {
    if (!transporter) {
      if (service?.toLowerCase() === 'gmail' || host?.includes('gmail') || user.endsWith('@gmail.com')) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        transporter = nodemailer.createTransport({
          host: host || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false,
          },
        });
      }
    }
    return transporter;
  }
  return null;
}

export async function sendOtpEmail(toEmail: string, otp: string, firstName: string): Promise<boolean> {
  const fromUser = process.env.SMTP_USER?.trim();
  const fromAddress = process.env.SMTP_FROM || (fromUser ? `"AESCION Job Portal" <${fromUser}>` : '"AESCION Job Portal" <no-reply@aescion.com>');
  const subject = `Your AESCION Registration Verification Code: ${otp}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f8fb; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #eef0f5; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase; }
        .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; letter-spacing: 0.5px; }
        .body { padding: 32px 30px; color: #334155; }
        .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
        .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0284c7; font-family: monospace; }
        .expiry-note { font-size: 12px; color: #94a3b8; margin-top: 8px; }
        .warning { font-size: 12px; color: #ef4444; background: #fef2f2; border-left: 3px solid #ef4444; padding: 10px 14px; border-radius: 4px; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AESCION</div>
          <div class="subtitle">AI-Powered Job Portal & ATS</div>
        </div>
        <div class="body">
          <div class="greeting">Hello ${firstName || 'there'} 👋</div>
          <p class="text">Thank you for creating an account on AESCION. Please use the following 6-digit One-Time Password (OTP) to complete your email verification and activate your account:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">⏳ Valid for the next 10 minutes</div>
          </div>

          <div class="warning">
            🔒 If you did not request this code, please ignore this email or contact support if you suspect unauthorized activity.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AESCION Portal. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const transport = getTransporter();

  if (transport) {
    try {
      console.log(`📡 Sending OTP email via Gmail to: ${toEmail}...`);
      await transport.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`✅ [EMAIL DELIVERED] Successfully sent OTP email to: ${toEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ [SMTP DELIVERY FAILED] Could not deliver email to ${toEmail}:`, error);
      throw new Error(`Email delivery failed: ${(error as any)?.message || 'SMTP error'}`);
    }
  } else {
    console.warn('\n⚠️ [SMTP NOT CONFIGURED] Check SMTP_USER and SMTP_PASS in backend/.env\n');
    return true;
  }
}
