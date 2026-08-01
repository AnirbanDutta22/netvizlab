import { childLogger } from "@/logger/index.js";
import { AppError, createAppError, err, ok, Result } from "@netvizlab/shared";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const logger = childLogger({ module: "spawn-runner" });

/* The ONLY binaries this server is ever allowed to execute. This is a
closed set — there is no code path that accepts a binary name from
user input.*/
export const WHITELISTED_BINARIES = ["ping"] as const; // more to be added
export type WhitelistedBinary = (typeof WHITELISTED_BINARIES)[number];

export interface RunningProcess {
  onLine(callback: (line: string) => void): void;
  onErrorLine(callback: (line: string) => void): void;
  onExit(callback: (code: number | null, timedOut: boolean) => void): void;
  kill(): void;
}

interface SpawnOptions {
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
}

export const spawnWhitelistedCommand = (
  binary: WhitelistedBinary,
  args: readonly string[],
  options: SpawnOptions,
): Result<RunningProcess, AppError> => {
  if (!WHITELISTED_BINARIES.includes(binary)) {
    return err(
      createAppError(
        "COMMAND_NOT_ALLOWED",
        `Binary "${binary}" is not whitelisted.`,
      ),
    ); // returns {ok: false, error:{code, message}}
  }

  let child;
  try {
    child = spawn(binary, [...args], {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (spawnError) {
    logger.error({ err: spawnError, binary }, "Failed to spawn worker process");
    return err(
      createAppError(
        "WORKER_SPAWN_ERROR",
        `Unable to start "${binary}". Is it installed?`,
      ),
    ); // returns {ok: false, error:{code, message}}
  }

  let timedOut = false;
  const exitCallbacks: Array<(code: number | null, timedOut: boolean) => void> =
    [];
  const timeoutHandle = setTimeout(() => {
    timedOut = true;
    logger.warn(
      { binary, timeoutMs: options.timeoutMs },
      "Worker exceeded timeout, killing",
    );
    child.kill("SIGTERM");
  }, options.timeoutMs);

  const abortListener = () => {
    logger.info({ binary }, "Worker cancelled by client");
    child.kill("SIGTERM");
  };
  options.signal?.addEventListener("abort", abortListener);

  const cleanup = () => {
    clearTimeout(timeoutHandle);
    options.signal?.removeEventListener("abort", abortListener);
  };

  child.on("close", (code) => {
    cleanup();
    for (const cb of exitCallbacks) cb(code, timedOut);
  });

  child.on("error", (processError) => {
    logger.error({ err: processError, binary }, "Worker process error");
    cleanup();
    for (const cb of exitCallbacks) cb(null, timedOut);
  });

  const stdoutReader = createInterface({ input: child.stdout });
  const stderrReader = createInterface({ input: child.stderr });

  return ok({
    onLine: (callback) => stdoutReader.on("line", callback),
    onErrorLine: (callback) => stderrReader.on("line", callback),
    onExit: (callback) => exitCallbacks.push(callback),
    kill: () => child.kill("SIGTERM"),
  }); // returns {ok: true, }
};
