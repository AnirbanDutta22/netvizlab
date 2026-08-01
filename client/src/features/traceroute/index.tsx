import { Panel } from "../../shared/ui/panel";
import { Badge } from "../../shared/ui/badge";

export const TraceroutePage = () => (
  <div className="mx-auto max-w-5xl space-y-5 p-6">
    <header className="flex items-center justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Command
        </p>
        <h1 className="font-display text-xl font-semibold">Traceroute</h1>
      </div>
      <Badge>coming soon</Badge>
    </header>
    <Panel>
      <p className="text-sm text-ink-muted">
        Hop-by-hop route visualization with clickable hops and a world map is on
        the way — built on the same FeatureHandler architecture as Ping.
      </p>
    </Panel>
  </div>
);
