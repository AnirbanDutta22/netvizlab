import type { PropsWithChildren } from 'react';

type BadgeTone = 'neutral' | 'signal' | 'healthy' | 'degraded' | 'loss';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-bg-raised text-ink-muted border-bg-hairline',
  signal: 'bg-signal/10 text-signal border-signal/30',
  healthy: 'bg-healthy/10 text-healthy border-healthy/30',
  degraded: 'bg-degraded/10 text-degraded border-degraded/30',
  loss: 'bg-loss/10 text-loss border-loss/30',
};

interface BadgeProps extends PropsWithChildren {
  readonly tone?: BadgeTone;
}

export const Badge = ({ tone = 'neutral', children }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${TONE_CLASSES[tone]}`}
  >
    {children}
  </span>
);
