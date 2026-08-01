import { useState, type FormEvent } from "react";
import { PING_LIMITS } from "@netvizlab/shared";
import { Button } from "../../../shared/ui/button";

interface CommandInputProps {
  readonly status: "idle" | "running" | "completed" | "error";
  readonly onRun: (host: string, count: number) => void;
  readonly onCancel: () => void;
}

export const CommandInput = ({
  status,
  onRun,
  onCancel,
}: CommandInputProps) => {
  const [host, setHost] = useState("1.1.1.1");
  const [count, setCount] = useState<number>(PING_LIMITS.DEFAULT_COUNT);
  const running = status === "running";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!running && host.trim()) onRun(host.trim(), count);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="flex flex-1 items-center rounded-md border border-bg-hairline bg-bg-raised px-3 focus-within:border-signal/50">
        <span className="font-mono text-sm text-ink-faint">ping</span>
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="hostname or IP address"
          disabled={running}
          className="w-full bg-transparent px-2 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2 font-mono text-xs text-ink-muted">
        count
        <input
          type="number"
          min={PING_LIMITS.MIN_COUNT}
          max={PING_LIMITS.MAX_COUNT}
          value={count}
          disabled={running}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-16 rounded-md border border-bg-hairline bg-bg-raised px-2 py-2 text-center font-mono text-sm text-ink focus:border-signal/50 focus:outline-none"
        />
      </label>
      {running ? (
        <Button type="button" variant="danger" onClick={onCancel}>
          Stop
        </Button>
      ) : (
        <Button type="submit" disabled={!host.trim()}>
          Run
        </Button>
      )}
    </form>
  );
};
