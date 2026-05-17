import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';

type Props = { className?: string; compact?: boolean };

export function ThemeToggle({ className = '', compact = false }: Props) {
  const { resolvedTheme, toggleLightDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleLightDark}
      className={`flex items-center rounded-card border border-border text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg ${
        compact ? 'p-2' : 'gap-2 px-3 py-2 text-sm'
      } ${compact ? '' : 'justify-center'} ${className}`}
      aria-label={
        resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      title={resolvedTheme === 'dark' ? 'Light theme' : 'Dark theme'}
    >
      {resolvedTheme === 'dark' ? (
        <AppIcon icon={Sun} size={20} strokeWidth={ICON_STROKE} />
      ) : (
        <AppIcon icon={Moon} size={20} strokeWidth={ICON_STROKE} />
      )}
      {!compact && (
        <span className="hidden min-[360px]:inline">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
