import pino from "pino";
import { env } from "../config/env.js";

/**
 * Single shared Pino logger instance. `console.log` is dissuaded in production code.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss.l" },
        }
      : undefined,
  base: { service: "netvizlab-server" },
});

export const childLogger = (bindings: Record<string, unknown>) =>
  logger.child(bindings);
