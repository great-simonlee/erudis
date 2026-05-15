import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

export function PricingPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-2xl text-fg">Plans</h1>
      <p className="text-sm text-fg-muted leading-relaxed">
        Pro unlocks full profile visitor analytics, higher limits, and more. Billing integration
        ships in a later phase — this page is a placeholder for upgrade CTAs across the app.
      </p>
      <section className="rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Free</h2>
        <p className="mt-2 text-sm text-fg-muted">Core feed, labs, discover, and limited visitor preview.</p>
      </section>
      <section className="rounded-card border border-brand/40 bg-brand/5 p-5">
        <h2 className="text-sm font-semibold text-brand">Pro</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Full visitor list, sorting, and institution insights. Contact sales when billing is live.
        </p>
      </section>
      <Link to={ROUTES.feed} className="inline-block text-sm text-brand hover:underline">
        Back to home
      </Link>
    </div>
  );
}
