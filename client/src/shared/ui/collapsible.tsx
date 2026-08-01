import { useState, type PropsWithChildren } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleProps extends PropsWithChildren {
  readonly title: string;
  readonly defaultOpen?: boolean;
}

export const Collapsible = ({ title, defaultOpen = false, children }: CollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-bg-hairline bg-bg-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-ink-faint"
        >
          ▸
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-bg-hairline px-4 py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
