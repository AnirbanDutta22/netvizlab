import cors from "cors";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "../../config/env.js";
import { logger } from "../../logger/index.js";

export const createHttpApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "10kb" }));
  app.use(pinoHttp({ logger }));

  /* Rate limiting protects the underlying spawn() calls from abuse
  this is the HTTP-layer counterpart to the per-socket session cap
  enforced in the WebSocket layer.*/
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", uptimeSeconds: process.uptime() });
  });

  return app;
};
