import { Link } from 'react-router-dom';
import { ErudisLogo } from '../brand/ErudisLogo';
import { ROUTES } from '../../constants';

export function LandingPublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface">
      <div className="mx-auto flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:max-w-6xl">
        <ErudisLogo variant="header" to="/" link />
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link
            to={ROUTES.register}
            className="rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/10 sm:px-4"
          >
            Join now
          </Link>
          <Link
            to={ROUTES.login}
            className="rounded-full border border-brand px-3 py-1.5 text-sm font-semibold text-brand sm:px-4 sm:py-2"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
