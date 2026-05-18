import { Link } from 'react-router-dom';
import { SignInForm } from '../components/auth/SignInForm';
import { ErudisLogo } from '../components/brand/ErudisLogo';
import { LandingHeroVisual } from '../components/landing/LandingHeroVisual';
import { LandingVisionSections } from '../components/landing/LandingVisionSections';
import { ROUTES } from '../constants';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-fg">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16">
          <ErudisLogo variant="header" to="/" />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to={ROUTES.register}
              className="rounded-full px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
            >
              Join now
            </Link>
            <a
              href="#sign-in"
              className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
            >
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-border bg-surface px-4 pb-16 pt-10 sm:pb-20 sm:pt-14">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="order-2 lg:order-1">
              <h1 className="font-display text-[2rem] leading-[1.15] text-fg sm:text-5xl sm:leading-tight">
                Where research lives, learns, and connects
              </h1>
              <p className="mt-4 max-w-md text-base text-fg-muted sm:text-lg">
                Verified labs, research logs, papers, and opportunities—for students, postdocs, and
                faculty building real science together.
              </p>

              <div
                id="sign-in"
                className="mt-8 max-w-md scroll-mt-24 rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8"
              >
                <p className="text-sm font-medium text-fg-muted">Sign in with your institutional account</p>
                <div className="mt-5">
                  <SignInForm showFirebaseNotice={false} />
                </div>
                <p className="mt-6 text-center text-sm text-fg-subtle">
                  New to THE ERUDIS?{' '}
                  <Link className="font-semibold text-brand hover:underline" to={ROUTES.register}>
                    Join now
                  </Link>
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <LandingHeroVisual />
            </div>
          </div>
        </section>

        <LandingVisionSections />
      </main>
    </div>
  );
}
