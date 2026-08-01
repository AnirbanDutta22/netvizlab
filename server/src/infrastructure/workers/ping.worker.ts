import {
  AppError,
  PING_LIMITS,
  PingRequestDto,
  Result,
} from "@netvizlab/shared";
import {
  RunningProcess,
  spawnWhitelistedCommand,
} from "../process/spawn-runner.js";

export const runPingWorker = (
  request: PingRequestDto,
  signal: AbortSignal,
): Result<RunningProcess, AppError> => {
  const args = ["-c", String(request.count), request.host];

  return spawnWhitelistedCommand("ping", args, {
    timeoutMs: PING_LIMITS.TIMEOUT_MS,
    signal,
  });
};
