import { type LabelHTMLAttributes } from 'react';

export function Label({
  className = '',
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-xs font-medium uppercase tracking-wide text-fg-muted ${className}`}
      {...props}
    />
  );
}
