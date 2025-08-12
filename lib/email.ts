import nodemailer from "nodemailer";
import { env } from "@/config/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false },
  });
  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
  try {
    const tx = getTransporter();
    await tx.sendMail({
      from: `"DevMatch" <${env.SENDER_EMAIL}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  const subject = "Verify your DevMatch account";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">DevMatch Account Verification</h2>
      <p>Please use the following code to verify your account:</p>
      <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${otp}</p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

export async function sendResetPasswordEmail({ email, resetUrl }: { email: string; resetUrl: string }) {
  const subject = "Reset your DevMatch password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">DevMatch Password Reset</h2>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" 
           style="background-color: #2563eb; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL in your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject,
      html,
      text: `To reset your password, visit this link: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    });
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false };
  }
}
