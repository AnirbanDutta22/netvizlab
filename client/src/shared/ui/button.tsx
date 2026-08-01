import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-signal text-bg font-medium hover:bg-signal/90 disabled:bg-bg-raised disabled:text-ink-faint',
  ghost: 'bg-transparent text-ink-muted border border-bg-hairline hover:text-ink hover:border-ink-faint',
  danger: 'bg-loss/10 text-loss border border-loss/30 hover:bg-loss/20',
};

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => (
  <button
    className={`rounded-md px-3.5 py-2 text-sm transition-colors duration-150 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  />
);
