import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string(),
  NODE_ENV: z.string(),
  JWT_SECRET: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_PORT: z.coerce.number(),
  SENDER_EMAIL: z.string(),
  SMTP_HOST: z.string(),
});

const result = envSchema.safeParse(process.env);

function buildDevDefaults() {
  return {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devmatch',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'nextauth-dev-secret',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'no-reply@example.com',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
    SMTP_PORT: Number(process.env.SMTP_PORT || '1025'),
    SENDER_EMAIL: process.env.SENDER_EMAIL || 'no-reply@example.com',
    SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  } as const;
}

export const env = result.success ? (result.data as any) : (buildDevDefaults() as any);