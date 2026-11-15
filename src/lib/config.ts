import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default(
    "postgresql://neondb_owner:npg_k6BGtLPZj4of@ep-floral-cell-bdyupono-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"
  ),
  AWS_ENDPOINT_URL_S3: z.string().default(
    "https://br-dark-frog-bd3plppa.storage.c-8.us-east-2.aws.neon.tech"
  ),
  AWS_ACCESS_KEY_ID: z.string().default("nak_live_70bab7e713bf447dbbf89cd8121c107d"),
  AWS_SECRET_ACCESS_KEY: z.string().default(
    "nsk_live_0305a22b83750084f5d66d72963a0e80bb5f209c63775a2ba00728d37848fa8d"
  ),
  AWS_REGION: z.string().default("us-east-2"),
  S3_BUCKET_NAME: z.string().default("assets"),
  CHARIOW_API_KEY: z.string().default(
    "napi_45n794ezvx4v6ilheny68pwd4zqonoyurrzodeddr4rl8vlfs3u7121pyxq6l7i9"
  ),
  CHARIOW_WEBHOOK_SECRET: z.string().default("chariow_sec_live_hotelgest_pilot_2026"),
  CHARIOW_PLAN_MONTHLY_XOF: z.coerce.number().default(100000),
  CHARIOW_PLAN_SEMIANNUAL_XOF: z.coerce.number().default(540000),
  CHARIOW_PLAN_ANNUAL_XOF: z.coerce.number().default(840000),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.enum(["XOF", "EUR", "USD"]).default("XOF"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("fr"),
  JWT_SECRET: z.string().default("hotelgest-production-ready-jwt-secret-key-32-chars-long"),
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
  DEFAULT_CURRENCY: (parsedEnv.success ? parsedEnv.data.NEXT_PUBLIC_DEFAULT_CURRENCY : "XOF") as "XOF" | "EUR" | "USD",
  DEFAULT_LOCALE: parsedEnv.success ? parsedEnv.data.NEXT_PUBLIC_DEFAULT_LOCALE : "fr",
  JWT_SECRET: parsedEnv.success ? parsedEnv.data.JWT_SECRET : "hotelgest-production-ready-jwt-secret-key-32-chars-long",
};
