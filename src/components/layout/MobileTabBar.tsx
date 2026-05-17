import { NavLink } from 'react-router-dom';
import { Briefcase, Compass, FlaskConical, Home, Plus } from 'lucide-react';
import { ROUTES } from '../../constants';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center justify-center py-2 text-[10px] uppercase tracking-wide ${
    isActive ? 'text-brand' : 'text-fg-subtle'
  }`;

const tabIconClass = 'mb-0.5';

function IconPlus() {
  return (
    <span className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-fg">
      <Plus size={22} strokeWidth={2} aria-hidden />
    </span>
  );
}

export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface-card pb-3 shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.1)] dark:border-t-2 dark:shadow-[0_-8px_28px_-6px_rgba(0,0,0,0.7)] md:hidden"
      aria-label="Mobile"
    >
      <NavLink to={ROUTES.feed} className={tabClass} end>
        <AppIcon icon={Home} size={18} strokeWidth={ICON_STROKE} className={tabIconClass} />
        Home
      </NavLink>
      <NavLink to={ROUTES.discover} className={tabClass}>
        <AppIcon icon={Compass} size={18} strokeWidth={ICON_STROKE} className={tabIconClass} />
        Discover
      </NavLink>
      <NavLink to={ROUTES.feed} className={tabClass}>
        <IconPlus />
        Post
      </NavLink>
      <NavLink to={ROUTES.jobs} className={tabClass}>
        <AppIcon icon={Briefcase} size={18} strokeWidth={ICON_STROKE} className={tabIconClass} />
        Jobs
      </NavLink>
      <NavLink to={ROUTES.labs} className={tabClass} end>
        <AppIcon icon={FlaskConical} size={18} strokeWidth={ICON_STROKE} className={tabIconClass} />
        Labs
      </NavLink>
    </nav>
  );
}
