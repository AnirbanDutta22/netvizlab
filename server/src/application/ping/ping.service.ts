import {
  createAppError,
  ok,
  type AppError,
  type PingEvent,
  type PingRequestDto,
  type Result,
  type SessionId,
} from "@netvizlab/shared";
import type { FeatureHandler } from "../common/feature-handler.js";
import { validatePingRequest } from "../../domain/ping/ping-validator.js";
import { runPingWorker } from "../../infrastructure/workers/ping.worker.js";
import { PingParser } from "../../infrastructure/parsers/ping-parser.js";
import { childLogger } from "../../logger/index.js";

const logger = childLogger({ module: "ping.service" });

/**
 * Pipeline for this feature: Validator -> Service (this file) -> Worker
 * -> Parser -> DTO -> emitted over WebSocket by the presentation layer.
 */
export class PingService implements FeatureHandler<PingRequestDto, PingEvent> {
  readonly command = "ping";

  private readonly activeSessions = new Map<SessionId, AbortController>();

  start(
    sessionId: SessionId,
    request: PingRequestDto,
    emit: (event: PingEvent) => void,
  ): Result<void, AppError> {
    const validated = validatePingRequest(request);
    if (!validated.ok) {
      emit({ type: "ping:error", error: validated.error });
      return validated;
    }

    const controller = new AbortController();
    this.activeSessions.set(sessionId, controller);

    const workerResult = runPingWorker(validated.value, controller.signal);
    if (!workerResult.ok) {
      this.activeSessions.delete(sessionId);
      emit({ type: "ping:error", error: workerResult.error });
      return workerResult;
    }

    const proc = workerResult.value;
    const parser = new PingParser();
    const startedAt = Date.now();

    logger.info({ sessionId, host: validated.value.host }, "command started");

    proc.onLine((line) => {
      const event = parser.parseLine(line);
      if (event) emit(event);
    });

    proc.onErrorLine((line) => {
      logger.warn({ sessionId, line }, "ping stderr");
    });

    proc.onExit((code, timedOut) => {
      const durationMs = Date.now() - startedAt;
      this.activeSessions.delete(sessionId);

      logger.info(
        { sessionId, code, timedOut, durationMs },
        "command finished",
      );

      if (timedOut) {
        emit({
          type: "ping:error",
          error: createAppError(
            "COMMAND_TIMEOUT",
            "Ping exceeded the maximum allowed time.",
          ),
        });
        return;
      }

      if (code !== 0 && code !== null) {
        emit({
          type: "ping:error",
          error: createAppError(
            "NETWORK_UNREACHABLE",
            "Host is unreachable or ping could not complete.",
            { exitCode: code },
          ),
        });
      }
    });

    return ok(undefined);
  }

  cancel(sessionId: SessionId): void {
    const controller = this.activeSessions.get(sessionId);
    if (controller) {
      logger.info({ sessionId }, "command cancelled by client");
      controller.abort();
      this.activeSessions.delete(sessionId);
    }
  }
}
