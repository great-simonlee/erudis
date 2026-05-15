import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../shared/ThemeToggle';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
      <span className="w-8" aria-hidden />
      <Link
        to={ROUTES.feed}
        className="font-display text-base tracking-tight text-fg"
      >
        THE ERUDIS
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle compact className="border-transparent hover:border-border" />
        <NotificationBell uid={user?.uid} compact />
        <Link
          to={user?.uid ? ROUTES.profile(user.uid) : ROUTES.feed}
          className="h-8 w-8 rounded-full border border-brand bg-zinc-200 dark:bg-zinc-800"
          aria-label={user?.uid ? 'My profile' : 'Home'}
        />
      </div>
    </header>
  );
}
