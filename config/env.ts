
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CLIENT_URL: z.string(),
  MONGODB_URI: z.string().optional(),
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SENDER_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
});

export const env = envSchema.parse(process.env);