import { Link, Navigate } from 'react-router-dom';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { LandingPublicHeader } from '../../components/landing/LandingPublicHeader';
import {
  MARKETING_PAGES,
  type MarketingPageSlug,
} from '../../content/marketingPages';

type MarketingPageProps = {
  slug: MarketingPageSlug;
};

export function MarketingPage({ slug }: MarketingPageProps) {
  const page = MARKETING_PAGES[slug];
  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-surface text-fg">
      <LandingPublicHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Share the Intelligence, Shape the World
          </p>
          <h1 className="mt-3 font-display text-3xl text-fg sm:text-4xl">{page.title}</h1>
          <p className="mt-4 text-lg text-fg-soft">{page.intro}</p>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-fg-muted">
            {page.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-10">
            <Link to="/" className="text-sm font-medium text-brand hover:underline">
              ← Back to home
            </Link>
          </p>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
