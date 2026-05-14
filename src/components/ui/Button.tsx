import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-card px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none';
    const styles =
      variant === 'primary'
        ? 'bg-brand text-fg hover:bg-brand-muted'
        : variant === 'outline'
          ? 'border border-border bg-transparent text-fg hover:bg-surface-raised'
          : 'bg-transparent text-fg-soft hover:bg-surface-raised';
    return (
      <button
        ref={ref}
        type="button"
        className={`${base} ${styles} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
