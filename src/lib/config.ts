import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default(
    process.env.DATABASE_URL || "postgresql://hotelgest_user:change_me_local@localhost:5432/hotelgest_db"
  ),
  AWS_ENDPOINT_URL_S3: z.string().default(
    process.env.AWS_ENDPOINT_URL_S3 || "https://storage.placeholder.neon.tech"
  ),
  AWS_ACCESS_KEY_ID: z.string().default(process.env.AWS_ACCESS_KEY_ID || "nak_local_placeholder"),
  AWS_SECRET_ACCESS_KEY: z.string().default(
    process.env.AWS_SECRET_ACCESS_KEY || "nsk_local_placeholder"
  ),
  AWS_REGION: z.string().default(process.env.AWS_REGION || "us-east-2"),
  S3_BUCKET_NAME: z.string().default(process.env.S3_BUCKET_NAME || "assets"),
  CHARIOW_API_KEY: z.string().default(process.env.CHARIOW_API_KEY || "napi_placeholder_test"),
  CHARIOW_WEBHOOK_SECRET: z.string().default(
    process.env.CHARIOW_WEBHOOK_SECRET || "chariow_sec_dev_hotelgest_placeholder"
  ),
  CHARIOW_PLAN_MONTHLY_XOF: z.coerce.number().default(100000),
  CHARIOW_PLAN_SEMIANNUAL_XOF: z.coerce.number().default(540000),
  CHARIOW_PLAN_ANNUAL_XOF: z.coerce.number().default(840000),
  KKIAPAY_PUBLIC_KEY: z.string().default(process.env.KKIAPAY_PUBLIC_KEY || "kkiapay_pk_placeholder"),
  KKIAPAY_PRIVATE_KEY: z.string().default(process.env.KKIAPAY_PRIVATE_KEY || "kkiapay_tpk_placeholder"),
  KKIAPAY_SECRET: z.string().default(process.env.KKIAPAY_SECRET || "kkiapay_tsk_placeholder"),
  CREATOR_ADMIN_EMAIL: z.string().default(process.env.CREATOR_ADMIN_EMAIL || "createur@hotelgest.io"),
  CREATOR_ADMIN_PASSWORD: z.string().default(process.env.CREATOR_ADMIN_PASSWORD || "HotelGest@Creator#2026!"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.enum(["XOF", "EUR", "USD"]).default("XOF"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("fr"),
  JWT_SECRET: z.string().default(process.env.JWT_SECRET || "hotelgest-default-dev-jwt-secret-key-32-chars-long"),
});

const parsedEnv = envSchema.safeParse(process.env);

export const envConfig = {
  DATABASE_URL: parsedEnv.success ? parsedEnv.data.DATABASE_URL : envSchema.shape.DATABASE_URL.parse(undefined),
  S3: {
    ENDPOINT: parsedEnv.success ? parsedEnv.data.AWS_ENDPOINT_URL_S3 : envSchema.shape.AWS_ENDPOINT_URL_S3.parse(undefined),
    ACCESS_KEY_ID: parsedEnv.success ? parsedEnv.data.AWS_ACCESS_KEY_ID : envSchema.shape.AWS_ACCESS_KEY_ID.parse(undefined),
    SECRET_ACCESS_KEY: parsedEnv.success ? parsedEnv.data.AWS_SECRET_ACCESS_KEY : envSchema.shape.AWS_SECRET_ACCESS_KEY.parse(undefined),
    REGION: parsedEnv.success ? parsedEnv.data.AWS_REGION : envSchema.shape.AWS_REGION.parse(undefined),
    BUCKET: parsedEnv.success ? parsedEnv.data.S3_BUCKET_NAME : envSchema.shape.S3_BUCKET_NAME.parse(undefined),
  },
  CHARIOW: {
    API_KEY: parsedEnv.success ? parsedEnv.data.CHARIOW_API_KEY : envSchema.shape.CHARIOW_API_KEY.parse(undefined),
    WEBHOOK_SECRET: parsedEnv.success ? parsedEnv.data.CHARIOW_WEBHOOK_SECRET : envSchema.shape.CHARIOW_WEBHOOK_SECRET.parse(undefined),
  },
  CHARIOW_PLANS: {
    MONTHLY_XOF: parsedEnv.success ? parsedEnv.data.CHARIOW_PLAN_MONTHLY_XOF : 100000,
    SEMIANNUAL_XOF: parsedEnv.success ? parsedEnv.data.CHARIOW_PLAN_SEMIANNUAL_XOF : 540000,
    ANNUAL_XOF: parsedEnv.success ? parsedEnv.data.CHARIOW_PLAN_ANNUAL_XOF : 840000,
  },
  KKIAPAY: {
    PUBLIC_KEY: parsedEnv.success ? parsedEnv.data.KKIAPAY_PUBLIC_KEY : "96e1b730129a11eba62483505cf48759",
    PRIVATE_KEY: parsedEnv.success ? parsedEnv.data.KKIAPAY_PRIVATE_KEY : "tpk_96e1b731129a11eba62483505cf48759",
    SECRET: parsedEnv.success ? parsedEnv.data.KKIAPAY_SECRET : "tsk_96e1b732129a11eba62483505cf48759",
  },
  CREATOR: {
    EMAIL: parsedEnv.success ? parsedEnv.data.CREATOR_ADMIN_EMAIL : "createur@hotelgest.io",
    PASSWORD: parsedEnv.success ? parsedEnv.data.CREATOR_ADMIN_PASSWORD : "HotelGest@Creator#2026!",
  },
  DEFAULT_CURRENCY: (parsedEnv.success ? parsedEnv.data.NEXT_PUBLIC_DEFAULT_CURRENCY : "XOF") as "XOF" | "EUR" | "USD",
  DEFAULT_LOCALE: parsedEnv.success ? parsedEnv.data.NEXT_PUBLIC_DEFAULT_LOCALE : "fr",
  JWT_SECRET: parsedEnv.success ? parsedEnv.data.JWT_SECRET : "hotelgest-production-ready-jwt-secret-key-32-chars-long",
};
