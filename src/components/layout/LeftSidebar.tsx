import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { roleLabel } from '../../utils/roleLabels';
import { ErudisLogo } from '../brand/ErudisLogo';
import { ThemeToggle } from '../shared/ThemeToggle';

function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"
      />
    </svg>
  );
}

function IconCompass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 5-4 7 2 2 7-4-7-2-2-7 4Z"
      />
    </svg>
  );
}

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M10.5 3a7.5 7.5 0 015.77 12.247l4.553 4.553-1.414 1.414-4.553-4.553A7.5 7.5 0 1110.5 3m0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11"
      />
    </svg>
  );
}

function IconFlask(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M9 3h6v2h-1v5l4 8v3H6v-3l4-8V5H9zm2 7-3 6h8l-3-6z"
      />
    </svg>
  );
}

function IconDoc(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M6 2h9l5 5v15H6zm2 2v16h10V8h-4V4zm2 10h6v2H10zm0 4h6v2H10z"
      />
    </svg>
  );
}

function IconBriefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M9 7V5h6v2h4v14H5V7zm2 0h4V5h-4zm-4 4v10h12V11zm2 3h2v4H7z"
      />
    </svg>
  );
}

function IconChat(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M4 4h16v12H7l-3 3zm3 3v6h10V7z"
      />
    </svg>
  );
}

function IconPerson(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m0 2c-4.33 0-8 2.17-8 5v3h16v-3c0-2.83-3.67-5-8-5"
      />
    </svg>
  );
}

function IconGear(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 15a3 3 0 1 1 3-3 3 3 0 0 1-3 3m7-2h-1.1a5 5 0 0 0-.5-1.2l.8-.8-2-2-.8.8a5 5 0 0 0-1.2-.5V4h-2.8v1.1a5 5 0 0 0-1.2.5l-.8-.8-2 2 .8.8a5 5 0 0 0-.5 1.2H4v2.8h1.1a5 5 0 0 0 .5 1.2l-.8.8 2 2 .8-.8a5 5 0 0 0 1.2.5V20h2.8v-1.1a5 5 0 0 0 1.2-.5l.8.8 2-2-.8-.8a5 5 0 0 0 .5-1.2H19z"
      />
    </svg>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 text-sm border-l-2 ${
    isActive
      ? 'border-brand bg-surface-raised text-fg'
      : 'border-transparent text-fg-muted hover:bg-surface-raised/60 hover:text-fg-soft'
  }`;

export function LeftSidebar() {
  const { user, profile } = useAuth();

  return (
    <aside className="hidden h-full min-h-0 w-[240px] shrink-0 flex-col overflow-y-auto border-r border-border bg-surface md:flex">
      <div className="border-b border-border px-4 py-4">
        <ErudisLogo variant="sidebar" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-4" aria-label="Main">
        <NavLink to={ROUTES.feed} className={navClass} end>
          <IconHome /> Home
        </NavLink>
        <NavLink to={ROUTES.discover} className={navClass}>
          <IconCompass /> Discover
        </NavLink>
        <NavLink to={ROUTES.labExplore} className={navClass}>
          <IconSearch /> Find labs
        </NavLink>
        <NavLink to={ROUTES.labs} className={navClass} end>
          <IconFlask /> My Labs
        </NavLink>
        <NavLink to={ROUTES.papers} className={navClass}>
          <IconDoc /> Papers
        </NavLink>
        <NavLink to={ROUTES.jobs} className={navClass} end>
          <IconBriefcase /> Jobs
        </NavLink>
        <NavLink to={ROUTES.messages} className={navClass}>
          <IconChat /> Messages
        </NavLink>
        {user?.uid && (
          <NavLink to={ROUTES.profile(user.uid)} className={navClass}>
            <IconPerson /> My profile
          </NavLink>
        )}
      </nav>

      <div className="mt-auto border-t border-border px-2 py-4">
        <div className="mb-3 px-1">
          <ThemeToggle className="w-full" />
        </div>
        <NavLink to={ROUTES.settings} className={navClass}>
          <IconGear /> Settings
        </NavLink>
        <NavLink
          to={user?.uid ? ROUTES.profile(user.uid) : ROUTES.feed}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-raised/60"
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full border border-brand object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand bg-zinc-200 text-xs font-medium text-fg-muted dark:bg-zinc-800">
              {(profile?.name ?? user?.displayName ?? '?').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-fg">
              {profile?.name ?? user?.displayName ?? 'Member'}
            </p>
            <p className="truncate text-xs text-fg-subtle">
              {profile?.role ? roleLabel(profile.role) : '—'}
            </p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
