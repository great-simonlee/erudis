import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { skipFirebase, demoUserId } from '../../config/flags';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../shared/ThemeToggle';

function IconBell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 1 0-12 0v5H4v2h16v-2z"
      />
    </svg>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const profileUid = user?.uid ?? (skipFirebase ? demoUserId : '');

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
      <span className="w-8" aria-hidden />
      <Link
        to={ROUTES.feed}
        className="font-display text-base tracking-tight text-fg"
      >
        THE ERUDIS
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle compact className="border-transparent hover:border-border" />
        <button
          type="button"
          className="p-2 text-fg-muted hover:text-fg"
          aria-label="Notifications"
        >
          <IconBell />
        </button>
        <Link
          to={ROUTES.profile(profileUid)}
          className="h-8 w-8 rounded-full border border-brand bg-zinc-200 dark:bg-zinc-800"
          aria-label="Profile"
        />
      </div>
    </header>
  );
}
