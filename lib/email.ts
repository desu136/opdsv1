import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${getBaseUrl()}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'EthioPharma Delivery'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Confirm your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0284c7; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0;">Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || 'EthioPharma'}</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">Please confirm your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.warn('⚠️ SMTP_USER is not defined in .env. Skipping actual email send and logging link instead.');
      console.log(`[DEV MODE] Verification Link for ${email}: ${confirmLink}`);
      return { success: true, message: 'Simulated email sent (Dev Mode)' };
    }
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${getBaseUrl()}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'EthioPharma Delivery'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0;">Password Reset Request</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">We received a request to reset the password for your account. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.warn('⚠️ SMTP_USER is not defined in .env. Skipping actual email send and logging link instead.');
      console.log(`[DEV MODE] Password Reset Link for ${email}: ${resetLink}`);
      return { success: true, message: 'Simulated email sent (Dev Mode)' };
    }
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
};

export const sendAccountApprovedEmail = async (email: string, role: string, name: string) => {
  const loginLink = `${getBaseUrl()}/login`;
  
  const roleName = role === 'PHARMACIST' ? 'Pharmacy' : 'Delivery Agent';

  const mailOptions = {
    from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'EthioPharma Delivery'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Account has been Approved! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eef2ff; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #22c55e; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0;">Account Approved!</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="color: #334155; font-size: 16px;">Hello ${name},</p>
          <p style="color: #334155; font-size: 16px;">Great news! Your <strong>${roleName}</strong> account has been reviewed and approved by our administration team.</p>
          <p style="color: #334155; font-size: 16px;">You now have full access to your dashboard and can immediately start receiving orders on the platform.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Login to Your Dashboard</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Welcome to the network!</p>
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.warn('⚠️ SMTP_USER is not defined in .env. Skipping actual email send and logging link instead.');
      console.log(`[DEV MODE] Approval Notification for ${email}`);
      return { success: true, message: 'Simulated notification sent (Dev Mode)' };
    }
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending account approved email:", error);
    return { success: false, error };
  }
};

export const sendNotificationEmail = async (email: string, title: string, message: string) => {
  const mailOptions = {
    from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'EthioPharma Delivery'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: `New Notification: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME || 'EthioPharma'}</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <h3 style="color: #0f172a; margin-top: 0;">${title}</h3>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">${message}</p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">You received this email because you have notifications enabled.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log(`[DEV MODE] Notification Email for ${email}: ${title} - ${message}`);
      return { success: true };
    }
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending notification email:", error);
    return { success: false, error };
  }
};
