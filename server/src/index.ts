import { createServer } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./logger/index.js";
import { createHttpApp } from "./presentation/http/app.js";
import { attachWebSocketServer } from "./presentation/socket/socket-server.js";
import { FeatureRegistry } from "./application/common/feature-handler.js";
import { PingService } from "./application/ping/ping.service.js";

const registry = new FeatureRegistry();
registry.register(new PingService());
// other services register here the same way

const app = createHttpApp();
const httpServer = createServer(app);
attachWebSocketServer(httpServer, registry);

httpServer.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    "NetVizLab server listening",
  );
});

const shutdown = (signal: string) => {
  logger.info({ signal }, "shutting down gracefully");
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
