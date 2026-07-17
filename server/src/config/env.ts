import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  MAX_CONCURRENT_SESSIONS_PER_SOCKET: z.coerce
    .number()
    .int()
    .positive()
    .default(3),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Intentional console usage: this is a fatal boot-time failure before
  // the logger even exists, and process is about to exit.
  // eslint-disable-next-line no-console
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env: Env = parsed.data;
