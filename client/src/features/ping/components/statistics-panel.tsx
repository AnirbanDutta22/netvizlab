import type { PingReplyDto, PingStatisticsDto } from "@netvizlab/shared";
import { Badge } from "../../../shared/ui/badge";

interface StatisticsPanelProps {
  readonly replies: readonly PingReplyDto[];
  readonly timeoutCount: number;
  readonly statistics: PingStatisticsDto | null;
}

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) => (
  <div>
    <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
      {label}
    </p>
    <p className={`font-mono text-lg font-medium ${tone ?? "text-ink"}`}>
      {value}
    </p>
  </div>
);

export const StatisticsPanel = ({
  replies,
  timeoutCount,
  statistics,
}: StatisticsPanelProps) => {
  const sent = statistics?.transmitted ?? replies.length + timeoutCount;
  const received = statistics?.received ?? replies.length;
  const lossPercent =
    statistics?.packetLossPercent ??
    (sent > 0 ? ((sent - received) / sent) * 100 : 0);
  const lastTtl = replies.at(-1)?.ttl;

  const lossTone =
    lossPercent === 0
      ? "text-healthy"
      : lossPercent < 20
        ? "text-degraded"
        : "text-loss";

  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Sent" value={String(sent)} />
      <Stat label="Received" value={String(received)} />
      <Stat
        label="Packet loss"
        value={`${lossPercent.toFixed(0)}%`}
        tone={lossTone}
      />
      <Stat label="TTL" value={lastTtl !== undefined ? String(lastTtl) : "—"} />
      <Stat
        label="Min RTT"
        value={statistics ? `${statistics.minRttMs.toFixed(1)}ms` : "—"}
      />
      <Stat
        label="Avg RTT"
        value={statistics ? `${statistics.avgRttMs.toFixed(1)}ms` : "—"}
      />
      <Stat
        label="Max RTT"
        value={statistics ? `${statistics.maxRttMs.toFixed(1)}ms` : "—"}
      />
      <Stat
        label="Jitter"
        value={statistics ? `${statistics.stddevRttMs.toFixed(1)}ms` : "—"}
      />
      {statistics && (
        <div className="col-span-2 pt-1">
          <Badge
            tone={
              lossPercent === 0
                ? "healthy"
                : lossPercent < 20
                  ? "degraded"
                  : "loss"
            }
          >
            {lossPercent === 0
              ? "healthy"
              : lossPercent < 20
                ? "degraded"
                : "unreliable"}
          </Badge>
        </div>
      )}
    </div>
  );
};
