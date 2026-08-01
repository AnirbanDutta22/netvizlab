import type { PropsWithChildren, ReactNode } from 'react';

interface PanelProps extends PropsWithChildren {
  readonly title?: string;
  readonly eyebrow?: string;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly noPadding?: boolean;
}

export const Panel = ({ title, eyebrow, action, className = '', noPadding, children }: PanelProps) => (
  <section
    className={`rounded-lg border border-bg-hairline bg-bg-panel ${className}`}
  >
    {(title || action) && (
      <header className="flex items-center justify-between border-b border-bg-hairline px-4 py-3">
        <div>
          {eyebrow && (
            <p className="mb-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="font-display text-sm font-medium text-ink">{title}</h2>}
        </div>
        {action}
      </header>
    )}
    <div className={noPadding ? '' : 'p-4'}>{children}</div>
  </section>
);
