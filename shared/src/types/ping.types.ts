import type { AppError } from "../errors/app-error.js";

export interface PingRequestDto {
  readonly host: string;
  readonly count: number;
}

export interface PingReplyDto {
  readonly sequence: number;
  readonly bytes: number;
  readonly ttl: number;
  readonly rttMs: number;
}

export interface PingTimeoutDto {
  readonly sequence: number;
}

export interface PingStatisticsDto {
  readonly transmitted: number;
  readonly received: number;
  readonly packetLossPercent: number;
  readonly minRttMs: number;
  readonly avgRttMs: number;
  readonly maxRttMs: number;
  readonly stddevRttMs: number;
  readonly durationMs: number;
}

export type PingEvent =
  | {
      readonly type: "ping:started";
      readonly host: string;
      readonly resolvedIp: string;
    }
  | { readonly type: "ping:reply"; readonly reply: PingReplyDto }
  | { readonly type: "ping:timeout"; readonly timeout: PingTimeoutDto }
  | { readonly type: "ping:completed"; readonly statistics: PingStatisticsDto }
  | { readonly type: "ping:error"; readonly error: AppError };
