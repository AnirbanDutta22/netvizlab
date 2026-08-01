// Centralized error contract shared by client and server

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "COMMAND_NOT_ALLOWED"
  | "COMMAND_TIMEOUT"
  | "DNS_RESOLUTION_ERROR"
  | "NETWORK_UNREACHABLE"
  | "PARSER_ERROR"
  | "WORKER_SPAWN_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

interface BaseAppError<TCode extends AppErrorCode> {
  readonly code: TCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export type ValidationError = BaseAppError<"VALIDATION_ERROR">;
export type CommandNotAllowedError = BaseAppError<"COMMAND_NOT_ALLOWED">;
export type CommandTimeoutError = BaseAppError<"COMMAND_TIMEOUT">;
export type DnsResolutionError = BaseAppError<"DNS_RESOLUTION_ERROR">;
export type NetworkUnreachableError = BaseAppError<"NETWORK_UNREACHABLE">;
export type ParserError = BaseAppError<"PARSER_ERROR">;
export type WorkerSpawnError = BaseAppError<"WORKER_SPAWN_ERROR">;
export type RateLimitedError = BaseAppError<"RATE_LIMITED">;
export type InternalError = BaseAppError<"INTERNAL_ERROR">;

export type AppError =
  | ValidationError
  | CommandNotAllowedError
  | CommandTimeoutError
  | DnsResolutionError
  | NetworkUnreachableError
  | ParserError
  | WorkerSpawnError
  | RateLimitedError
  | InternalError;

export const createAppError = <TCode extends AppErrorCode>(
  code: TCode,
  message: string,
  details?: Readonly<Record<string, unknown>>,
): BaseAppError<TCode> => ({ code, message, details });
