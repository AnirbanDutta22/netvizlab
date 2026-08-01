import { useAppSelector } from "../../app/hooks";
import {
  selectActivityEntries,
  type ActivityLevel,
} from "../../shared/store/activity-log.slice";

const LEVEL_DOT: Record<ActivityLevel, string> = {
  info: "bg-ink-faint",
  success: "bg-healthy",
  warning: "bg-degraded",
  error: "bg-loss",
};

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const ActivityLogRail = () => {
  const entries = useAppSelector(selectActivityEntries);

  return (
    <aside className="flex h-full flex-col border-l border-bg-hairline bg-bg-panel">
      <div className="border-b border-bg-hairline px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Activity Log
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {entries.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Nothing yet — run a command to see activity here.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex gap-2.5 text-sm">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[entry.level]}`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-ink-muted">{entry.message}</p>
                  <p className="font-mono text-[11px] text-ink-faint">
                    {entry.command} · {formatTime(entry.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
