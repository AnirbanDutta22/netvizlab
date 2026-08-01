import { PingEvent, PingStatisticsDto } from "@netvizlab/shared";

const STARTED_PATTERN = /^PING\s+\S+\s+\(([^)]+)\)/;
const REPLY_PATTERN =
  /^(\d+)\s+bytes\s+from\s+.*?:\s+icmp_seq=(\d+)\s+ttl=(\d+)\s+time=([\d.]+)\s*ms/i;
const TIMEOUT_PATTERN = /Request timeout for icmp_seq\s*=?\s*(\d+)/i;
const SUMMARY_PATTERN =
  /(\d+)\s+packets transmitted,\s+(\d+)\s+(?:packets\s+)?received,\s*(?:\+\d+\s+errors,\s*)?([\d.]+)%\s+packet loss(?:,\s*time\s+(\d+)ms)?/i;
const RTT_PATTERN =
  /rtt min\/avg\/max\/mdev\s*=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\s*ms/i;

export class PingParser {
  private pendingSummary: {
    transmitted: number;
    received: number;
    packetLossPercent: number;
    durationMs: number;
  } | null = null;

  parseLine(line: string): PingEvent | null {
    const trimmed = line.trim();
    if (trimmed.length === 0) return null;

    const started = STARTED_PATTERN.exec(trimmed);
    if (started) {
      return {
        type: "ping:started",
        host: trimmed,
        resolvedIp: started[1] ?? "",
      };
    }

    const reply = REPLY_PATTERN.exec(trimmed);
    if (reply) {
      return {
        type: "ping:reply",
        reply: {
          bytes: Number(reply[1]),
          sequence: Number(reply[2]),
          ttl: Number(reply[3]),
          rttMs: Number(reply[4]),
        },
      };
    }

    const timeout = TIMEOUT_PATTERN.exec(trimmed);
    if (timeout) {
      return {
        type: "ping:timeout",
        timeout: {
          sequence: Number(timeout[1]),
        },
      };
    }

    const summary = SUMMARY_PATTERN.exec(trimmed);
    if (summary) {
      this.pendingSummary = {
        transmitted: Number(summary[1]),
        received: Number(summary[2]),
        packetLossPercent: Number(summary[3]),
        durationMs: Number(summary[4] ?? 0),
      };
      return null;
    }

    const rtt = RTT_PATTERN.exec(trimmed);
    if (rtt && this.pendingSummary) {
      const statistics: PingStatisticsDto = {
        ...this.pendingSummary,
        minRttMs: Number(rtt[1]),
        avgRttMs: Number(rtt[2]),
        maxRttMs: Number(rtt[3]),
        stddevRttMs: Number(rtt[4]),
      };
      return { type: "ping:completed", statistics };
    }

    return null;
  }

  buildFallbackStatistics(durationMs: number): PingStatisticsDto {
    return {
      transmitted: this.pendingSummary?.transmitted ?? 0,
      received: this.pendingSummary?.received ?? 0,
      packetLossPercent: this.pendingSummary?.packetLossPercent ?? 100,
      minRttMs: 0,
      avgRttMs: 0,
      maxRttMs: 0,
      stddevRttMs: 0,
      durationMs: this.pendingSummary?.durationMs ?? durationMs,
    };
  }
}
