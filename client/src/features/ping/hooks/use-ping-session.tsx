import { useCallback, useRef, useState } from "react";
import type {
  AppError,
  PingEvent,
  PingReplyDto,
  PingRequestDto,
  PingStatisticsDto,
  PingTimeoutDto,
  StreamEnvelope,
} from "@netvizlab/shared";
import { commandSocket } from "../../../shared/ws/socket-client";
import { useAppDispatch } from "../../../app/hooks";
import { logActivity } from "../../../shared/store/activity-log.slice";

export type PingStatus = "idle" | "running" | "completed" | "error";

interface PingSessionState {
  readonly status: PingStatus;
  readonly host: string;
  readonly resolvedIp: string | null;
  readonly replies: readonly PingReplyDto[];
  readonly timeouts: readonly PingTimeoutDto[];
  readonly statistics: PingStatisticsDto | null;
  readonly error: AppError | null;
}

const INITIAL_STATE: PingSessionState = {
  status: "idle",
  host: "",
  resolvedIp: null,
  replies: [],
  timeouts: [],
  statistics: null,
  error: null,
};

export const usePingSession = () => {
  const [state, setState] = useState<PingSessionState>(INITIAL_STATE);
  const sessionIdRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const dispatch = useAppDispatch();

  const start = useCallback(
    (request: PingRequestDto) => {
      unsubscribeRef.current?.();

      const sessionId = crypto.randomUUID();
      sessionIdRef.current = sessionId;
      setState({ ...INITIAL_STATE, status: "running", host: request.host });

      dispatch(
        logActivity({
          command: "ping",
          level: "info",
          message: `Starting ping to ${request.host}`,
        }),
      );

      unsubscribeRef.current = commandSocket.subscribe(
        sessionId,
        (envelope) => {
          const event = (envelope as StreamEnvelope<PingEvent>).payload;

          switch (event.type) {
            case "ping:started":
              setState((s) => ({ ...s, resolvedIp: event.resolvedIp }));
              break;
            case "ping:reply":
              setState((s) => ({ ...s, replies: [...s.replies, event.reply] }));
              break;
            case "ping:timeout":
              setState((s) => ({
                ...s,
                timeouts: [...s.timeouts, event.timeout],
              }));
              dispatch(
                logActivity({
                  command: "ping",
                  level: "warning",
                  message: `Timeout on sequence ${event.timeout.sequence}`,
                }),
              );
              break;
            case "ping:completed":
              setState((s) => ({
                ...s,
                status: "completed",
                statistics: event.statistics,
              }));
              dispatch(
                logActivity({
                  command: "ping",
                  level:
                    event.statistics.packetLossPercent > 0
                      ? "warning"
                      : "success",
                  message: `Completed — ${event.statistics.received}/${event.statistics.transmitted} replies, ${event.statistics.avgRttMs.toFixed(1)}ms avg`,
                }),
              );
              break;
            case "ping:error":
              setState((s) => ({ ...s, status: "error", error: event.error }));
              dispatch(
                logActivity({
                  command: "ping",
                  level: "error",
                  message: event.error.message,
                }),
              );
              break;
          }
        },
      );

      commandSocket.send({ type: "ping:start", sessionId, request });
    },
    [dispatch],
  );

  const cancel = useCallback(() => {
    if (sessionIdRef.current) {
      commandSocket.send({
        type: "session:cancel",
        sessionId: sessionIdRef.current,
      });
      setState((s) => (s.status === "running" ? { ...s, status: "idle" } : s));
    }
  }, []);

  return { ...state, start, cancel };
};
