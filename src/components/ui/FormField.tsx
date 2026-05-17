import type { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </label>
      {hint ? <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{hint}</p> : null}
      <div className={hint ? 'mt-2' : 'mt-1.5'}>{children}</div>
    </div>
  );
}
