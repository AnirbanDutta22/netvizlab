import { usePingSession } from "./hooks/use-ping-session";
import { CommandInput } from "./components/command-input";
import { StatisticsPanel } from "./components/statistics-panel";
import { ExplanationPanel } from "./components/explanation-panel";
import { RawOutput } from "./components/raw-output";
import { PacketTravel } from "./visualizers/packet-travel";
import { RttChart } from "./visualizers/rtt-chart";
import { Panel } from "../../shared/ui/panel";
import { Badge } from "../../shared/ui/badge";
import { Collapsible } from "../../shared/ui/collapsible";

const STATUS_BADGE = {
  idle: <Badge>idle</Badge>,
  running: <Badge tone="signal">running</Badge>,
  completed: <Badge tone="healthy">completed</Badge>,
  error: <Badge tone="loss">error</Badge>,
} as const;

export const PingPage = () => {
  const session = usePingSession();

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            Command
          </p>
          <h1 className="font-display text-xl font-semibold">Ping</h1>
        </div>
        {STATUS_BADGE[session.status]}
      </header>

      <Panel>
        <CommandInput
          status={session.status}
          onRun={(host, count) => session.start({ host, count })}
          onCancel={session.cancel}
        />
      </Panel>

      {session.error && (
        <Panel className="border-loss/30">
          <p className="font-mono text-sm text-loss">{session.error.message}</p>
        </Panel>
      )}

      <Panel title="Visualization" eyebrow="Live packet travel" noPadding>
        <PacketTravel
          host={session.host}
          resolvedIp={session.resolvedIp}
          replies={session.replies}
          timeouts={session.timeouts}
        />
      </Panel>

      <div className="grid grid-cols-3 gap-5">
        <Panel title="RTT over time" className="col-span-2">
          <RttChart replies={session.replies} />
        </Panel>
        <Panel title="Statistics">
          <StatisticsPanel
            replies={session.replies}
            timeoutCount={session.timeouts.length}
            statistics={session.statistics}
          />
        </Panel>
      </div>

      <Panel title="What's happening" eyebrow="Explanation">
        <ExplanationPanel />
      </Panel>

      <Collapsible title="Raw terminal output">
        <RawOutput
          host={session.host}
          resolvedIp={session.resolvedIp}
          replies={session.replies}
          timeouts={session.timeouts}
          statistics={session.statistics}
        />
      </Collapsible>
    </div>
  );
};
