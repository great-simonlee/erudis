import { useTheme } from '../../contexts/ThemeContext';

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1m0 18a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1M5.64 5.64a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41m12.02 12.02a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 1 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41M4 13H3a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2m18 0h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2m-2.93-7.07a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0M7.05 16.95a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0"
      />
    </svg>
  );
}

function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M21 12.8A9 9 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8"
      />
    </svg>
  );
}

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
      {resolvedTheme === 'dark' ? <IconSun /> : <IconMoon />}
      {!compact && (
        <span className="hidden min-[360px]:inline">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
