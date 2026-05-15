import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center justify-center py-2 text-[10px] uppercase tracking-wide ${
    isActive ? 'text-brand' : 'text-fg-subtle'
  }`;

function IconPlus() {
  return (
    <span className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg font-light text-fg">
      +
    </span>
  );
}

export function MobileTabBar() {
  const { user } = useAuth();
  const profilePath = user?.uid ? ROUTES.profile(user.uid) : ROUTES.feed;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-3 md:hidden"
      aria-label="Mobile"
    >
      <NavLink to={ROUTES.feed} className={tabClass} end>
        <span className="text-base leading-none">⌂</span>
        Home
      </NavLink>
      <NavLink to={ROUTES.discover} className={tabClass}>
        <span className="text-base leading-none">◎</span>
        Discover
      </NavLink>
      <NavLink to={ROUTES.feed} className={tabClass}>
        <IconPlus />
        Post
      </NavLink>
      <NavLink to={ROUTES.labs} className={tabClass}>
        <span className="text-base leading-none">⚗</span>
        Labs
      </NavLink>
      <NavLink to={profilePath} className={tabClass}>
        <span className="text-base leading-none">◉</span>
        Profile
      </NavLink>
    </nav>
  );
}
