import { Link } from 'react-router-dom';
import { LANDING_FOOTER_LINKS } from '../../content/marketingPages';
import { ROUTES } from '../../constants';

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <nav
          className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-fg-muted"
          aria-label="Site"
        >
          {LANDING_FOOTER_LINKS.map((item) => (
            <Link key={item.path} to={item.path} className="hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-4 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-subtle">
            © {new Date().getFullYear()} THE ERUDIS · Share the Intelligence, Shape the World
          </p>
          <nav className="flex flex-wrap gap-4 text-sm text-fg-muted" aria-label="Account">
            <Link to={ROUTES.register} className="hover:text-brand">
              Join
            </Link>
            <Link to={ROUTES.login} className="hover:text-brand">
              Sign in
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
