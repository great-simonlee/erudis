import { type SelectHTMLAttributes, forwardRef } from 'react';

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full appearance-none rounded-card border border-border bg-surface-card bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat px-3 py-2.5 pr-9 text-sm text-fg focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    >
      {children}
    </select>
  )
);
FormSelect.displayName = 'FormSelect';
