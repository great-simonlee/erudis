import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  Compass,
  FileText,
  FlaskConical,
  Home,
  MessageCircle,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { isInstitutionAdmin } from '../../lib/institutionAccess';
import { roleLabel } from '../../utils/roleLabels';
import { ErudisLogo } from '../brand/ErudisLogo';
import { ThemeToggle } from '../shared/ThemeToggle';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';

const navIcon = (icon: LucideIcon) => (
  <AppIcon icon={icon} size={20} strokeWidth={ICON_STROKE} />
);

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
    isActive
      ? 'bg-brand/12 font-medium text-brand ring-1 ring-brand/25'
      : 'text-fg-muted hover:bg-surface-raised hover:text-fg-soft'
  }`;

export function LeftSidebar() {
  const { user, profile } = useAuth();

  return (
    <aside className="erudis-zone-nav hidden h-full min-h-0 w-[252px] shrink-0 flex-col overflow-y-auto md:flex">
      <div className="px-4 py-5">
        <ErudisLogo variant="sidebar" />
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-fg-subtle">
          Navigation
        </p>
      </div>

      <nav className="erudis-nav-deck flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
        <NavLink to={ROUTES.feed} className={navClass} end>
          {navIcon(Home)} Home
        </NavLink>
        <NavLink to={ROUTES.discover} className={navClass}>
          {navIcon(Compass)} Discover
        </NavLink>
        <NavLink to={ROUTES.labExplore} className={navClass}>
          {navIcon(Search)} Find labs
        </NavLink>
        <NavLink to={ROUTES.labs} className={navClass} end>
          {navIcon(FlaskConical)} My Labs
        </NavLink>
        {isInstitutionAdmin(profile) && profile?.institutionId && (
          <NavLink to={ROUTES.institution(profile.institutionId)} className={navClass}>
            {navIcon(Building2)} My institution
          </NavLink>
        )}
        <NavLink to={ROUTES.papers} className={navClass}>
          {navIcon(FileText)} Papers
        </NavLink>
        <NavLink to={ROUTES.jobs} className={navClass} end>
          {navIcon(Briefcase)} Jobs
        </NavLink>
        <NavLink to={ROUTES.messages} className={navClass}>
          {navIcon(MessageCircle)} Messages
        </NavLink>
        {user?.uid && (
          <NavLink to={ROUTES.profile(user.uid)} className={navClass}>
            {navIcon(User)} My profile
          </NavLink>
        )}
        <div className="my-2 border-t border-border" />
        <NavLink to={ROUTES.settings} className={navClass}>
          {navIcon(Settings)} Settings
        </NavLink>
        <div className="px-1 py-1">
          <ThemeToggle className="w-full" />
        </div>
      </nav>

      {user && (
        <div className="erudis-scholar-card">
          <div className="erudis-scholar-stripe" aria-hidden />
          <NavLink
            to={user.uid ? ROUTES.profile(user.uid) : ROUTES.feed}
            className="relative -mt-6 block px-4 pb-4 pt-0"
          >
            <div className="flex items-end gap-3">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border-[3px] border-surface-card object-cover shadow-md ring-2 ring-brand/40"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-surface-card bg-surface-raised text-sm font-medium text-fg-muted shadow-md ring-2 ring-brand/40">
                  {(profile?.name ?? user.displayName ?? '?').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 pb-0.5">
                <p className="truncate text-sm font-semibold text-fg">
                  {profile?.name ?? user.displayName ?? 'Member'}
                </p>
                <p className="truncate text-xs text-brand">
                  {profile?.role ? roleLabel(profile.role) : '—'}
                </p>
                {profile?.institutionName ? (
                  <p className="mt-0.5 truncate text-[11px] text-fg-subtle">
                    {profile.institutionName}
                  </p>
                ) : null}
              </div>
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  );
}
