import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { ErudisLogo } from '../brand/ErudisLogo';
import { ThemeToggle } from '../shared/ThemeToggle';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';

export function Navbar() {
  const { user, profile } = useAuth();
  const profilePath = user?.uid ? ROUTES.profile(user.uid) : ROUTES.feed;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface-card px-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] dark:border-b-2 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.65)] md:hidden">
      <ErudisLogo variant="header" />
      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle compact className="border-transparent hover:border-border" />
        <Link
          to={ROUTES.messages}
          className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
          aria-label="Messages"
        >
          <AppIcon icon={MessageCircle} size={22} strokeWidth={ICON_STROKE} />
        </Link>
        <Link
          to={profilePath}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand bg-zinc-200 dark:bg-zinc-800"
          aria-label={user?.uid ? 'My profile' : 'Home'}
        >
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-fg-muted">
              {(profile?.name ?? user?.displayName ?? '?').slice(0, 1).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
