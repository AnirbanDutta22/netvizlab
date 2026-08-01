import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PingReplyDto, PingTimeoutDto } from "@netvizlab/shared";

interface PacketTravelProps {
  readonly host: string;
  readonly resolvedIp: string | null;
  readonly replies: readonly PingReplyDto[];
  readonly timeouts: readonly PingTimeoutDto[];
}

type TravelEvent =
  | { kind: "reply"; key: string; sequence: number; rttMs: number }
  | { kind: "timeout"; key: string; sequence: number };

/** Latency -> semantic color, same bands used in the RTT chart and statistics panel. */
const rttTone = (rttMs: number): "healthy" | "degraded" | "loss" => {
  if (rttMs < 80) return "healthy";
  if (rttMs < 200) return "degraded";
  return "loss";
};

const TONE_HEX: Record<"healthy" | "degraded" | "loss", string> = {
  healthy: "#5FE38C",
  degraded: "#FFB454",
  loss: "#FF5C7A",
};

const travelDuration = (rttMs: number) => {
  // Real RTTs on a LAN are near-instant and wouldn't read as motion —
  // we scale into a perceptible range while keeping relative order,
  // so a slower reply still visibly takes longer than a fast one.
  const clamped = Math.min(Math.max(rttMs, 5), 400);
  return 0.5 + (clamped / 400) * 1.1;
};

export const PacketTravel = ({
  host,
  resolvedIp,
  replies,
  timeouts,
}: PacketTravelProps) => {
  const [visible, setVisible] = useState<TravelEvent[]>([]);

  const latestEvents = useMemo<TravelEvent[]>(() => {
    const fromReplies: TravelEvent[] = replies.map((r) => ({
      kind: "reply",
      key: `r-${r.sequence}`,
      sequence: r.sequence,
      rttMs: r.rttMs,
    }));
    const fromTimeouts: TravelEvent[] = timeouts.map((t) => ({
      kind: "timeout",
      key: `t-${t.sequence}`,
      sequence: t.sequence,
    }));
    return [...fromReplies, ...fromTimeouts].sort(
      (a, b) => a.sequence - b.sequence,
    );
  }, [replies, timeouts]);

  useEffect(() => {
    setVisible((prev) => {
      const prevKeys = new Set(prev.map((e) => e.key));
      const fresh = latestEvents.filter((e) => !prevKeys.has(e.key));
      return [...prev, ...fresh];
    });
  }, [latestEvents]);

  return (
    <div className="relative flex h-56 flex-col justify-center px-8">
      <div className="flex items-center justify-between font-mono text-xs text-ink-faint">
        <span className="rounded border border-bg-hairline bg-bg-raised px-2 py-1 text-ink">
          you
        </span>
        <span className="rounded border border-bg-hairline bg-bg-raised px-2 py-1 text-ink">
          {resolvedIp ?? host}
        </span>
      </div>

      <div className="relative my-6 h-px w-full bg-bg-hairline">
        <AnimatePresence>
          {visible.map((event) => {
            const isTimeout = event.kind === "timeout";
            const tone = isTimeout ? "loss" : rttTone(event.rttMs);
            const duration = isTimeout ? 0.8 : travelDuration(event.rttMs);
            const travelDistance = isTimeout ? "55%" : "100%";

            return (
              <motion.div
                key={event.key}
                initial={{ left: "0%", opacity: 0 }}
                animate={{
                  left: travelDistance,
                  opacity: [0, 1, 1, isTimeout ? 0 : 1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: "easeInOut" }}
                onAnimationComplete={() => {
                  setVisible((prev) => prev.filter((e) => e.key !== event.key));
                }}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ filter: `drop-shadow(0 0 6px ${TONE_HEX[tone]})` }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: TONE_HEX[tone] }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="text-center font-mono text-[11px] text-ink-faint">
        each dot is one echo request · color = latency band
      </p>
    </div>
  );
};
