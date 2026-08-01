import type {
  PingReplyDto,
  PingStatisticsDto,
  PingTimeoutDto,
} from "@netvizlab/shared";

interface RawOutputProps {
  readonly host: string;
  readonly resolvedIp: string | null;
  readonly replies: readonly PingReplyDto[];
  readonly timeouts: readonly PingTimeoutDto[];
  readonly statistics: PingStatisticsDto | null;
}

export const RawOutput = ({
  host,
  resolvedIp,
  replies,
  timeouts,
  statistics,
}: RawOutputProps) => {
  const lines: string[] = [];

  if (resolvedIp) {
    lines.push(`PING ${host} (${resolvedIp}) 56(84) bytes of data.`);
  }

  const merged = [
    ...replies.map((r) => ({ ...r, kind: "reply" as const })),
    ...timeouts.map((t) => ({ ...t, kind: "timeout" as const })),
  ].sort((a, b) => a.sequence - b.sequence);

  for (const item of merged) {
    if (item.kind === "reply") {
      lines.push(
        `64 bytes from ${resolvedIp ?? host}: icmp_seq=${item.sequence} ttl=${item.ttl} time=${item.rttMs} ms`,
      );
    } else {
      lines.push(`Request timeout for icmp_seq ${item.sequence}`);
    }
  }

  if (statistics) {
    lines.push("");
    lines.push(`--- ${host} ping statistics ---`);
    lines.push(
      `${statistics.transmitted} packets transmitted, ${statistics.received} received, ${statistics.packetLossPercent}% packet loss, time ${statistics.durationMs}ms`,
    );
    lines.push(
      `rtt min/avg/max/mdev = ${statistics.minRttMs}/${statistics.avgRttMs}/${statistics.maxRttMs}/${statistics.stddevRttMs} ms`,
    );
  }

  return (
    <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-muted">
      {lines.length > 0 ? lines.join("\n") : "no output yet"}
    </pre>
  );
};
