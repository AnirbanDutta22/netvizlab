import type { Server as HttpServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import {
  createAppError,
  StreamEnvelope,
  toSessionId,
  type ClientMessage,
  type CommandName,
} from "@netvizlab/shared";
import type { FeatureRegistry } from "../../application/common/feature-handler.js";
import { env } from "../../config/env.js";
import { childLogger } from "../../logger/index.js";

const logger = childLogger({ module: "socket-server" });

const COMMAND_BY_MESSAGE_TYPE: Record<string, CommandName> = {
  "ping:start": "ping",
  // more to be added
};

/**
 * This is the ONLY file that knows about the WebSocket wire format.
 * It depends solely on `FeatureRegistry` / `FeatureHandler`, it has
 * zero knowledge of commands internals, which is what lets
 * new commands be added without editing this file (Open/Closed).
 */
export const attachWebSocketServer = (
  httpServer: HttpServer,
  registry: FeatureRegistry,
) => {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket: WebSocket) => {
    const socketSessions = new Set<string>();
    logger.info("client connected");

    const send = (envelope: StreamEnvelope<unknown>) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(envelope));
      }
    };

    socket.on("message", (raw) => {
      let message: ClientMessage;
      try {
        message = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        logger.warn("received malformed JSON message");
        return;
      }

      if (message.type === "session:cancel") {
        // We don't track which command a session belongs to here, so
        // cancellation is broadcast to every registered handler.
        // `cancel()` is defined to be a safe no-op for unknown session IDs.
        for (const command of new Set(Object.values(COMMAND_BY_MESSAGE_TYPE))) {
          registry.get(command)?.cancel(toSessionId(message.sessionId));
        }
        socketSessions.delete(message.sessionId);
        return;
      }

      const command = COMMAND_BY_MESSAGE_TYPE[message.type];
      if (!command) {
        logger.warn({ messageType: message.type }, "unknown message type");
        return;
      }

      if (socketSessions.size >= env.MAX_CONCURRENT_SESSIONS_PER_SOCKET) {
        send({
          sessionId: toSessionId(message.sessionId),
          command,
          timestamp: Date.now(),
          payload: {
            type: `${command}:error`,
            error: createAppError(
              "RATE_LIMITED",
              "Too many concurrent commands on this connection.",
            ),
          },
        });
        return;
      }

      const handler = registry.get(command);
      if (!handler) {
        logger.error({ command }, "no handler registered for command");
        return;
      }

      const sessionId = toSessionId(message.sessionId);
      socketSessions.add(sessionId);

      const emit = (payload: unknown) => {
        send({ sessionId, command, timestamp: Date.now(), payload });
      };

      const result = handler.start(sessionId, message.request, emit);
      if (!result.ok) {
        logger.warn(
          { sessionId, command, error: result.error },
          "command failed to start",
        );
      }
    });

    socket.on("close", () => {
      logger.info("client disconnected, cancelling active sessions");
      for (const sessionId of socketSessions) {
        for (const command of new Set(Object.values(COMMAND_BY_MESSAGE_TYPE))) {
          registry.get(command)?.cancel(toSessionId(sessionId));
        }
      }
      socketSessions.clear();
    });
  });

  return wss;
};
