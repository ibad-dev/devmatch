import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string(),
  NODE_ENV:z.string(),
  JWT_SECRET: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID : z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string(),
  SMTP_USER:z.string(),
  SMTP_PASSWORD :z.string(),
  SMTP_PORT: z.coerce.number(),
  SENDER_EMAIL:z.string(),
  SMTP_HOST:z.string(),
  

  });

export const env = envSchema.parse(process.env);