import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import { AppIcon, ICON_STROKE } from './AppIcon';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`pr-10 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted hover:text-fg"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <AppIcon icon={visible ? EyeOff : Eye} size={20} strokeWidth={ICON_STROKE} />
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
