import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignInForm } from '../components/auth/SignInForm';
import { ErudisLogo } from '../components/brand/ErudisLogo';
import { LandingHeroVisual } from '../components/landing/LandingHeroVisual';
import { LandingVisionSections } from '../components/landing/LandingVisionSections';
import { ROUTES } from '../constants';
import { Button } from '../components/ui/Button';

function OrDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border" />
      </div>
      <p className="relative mx-auto w-8 bg-surface text-center text-xs text-fg-subtle">or</p>
    </div>
  );
}

export function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-surface text-fg">
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
            <a
              href="#sign-in"
              className="rounded-full border border-brand px-3 py-1.5 text-sm font-semibold text-brand sm:px-4 sm:py-2"
            >
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Mobile-first auth hero (LinkedIn-style): headline → form → join → illustration */}
        <section className="border-b border-border bg-surface px-4 pb-10 pt-6 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-14">
          <div className="mx-auto w-full max-w-[22rem] sm:max-w-md lg:grid lg:max-w-6xl lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-0">
            <div className="flex flex-col">
              <h1 className="text-center font-display text-[1.65rem] font-semibold leading-[1.2] text-fg sm:text-left sm:text-4xl lg:text-5xl lg:leading-tight">
                Where curiosity becomes clarity
              </h1>
              <p className="mt-3 hidden text-base text-fg-muted sm:block lg:text-lg">
                Verified labs, research logs, papers, and opportunities—for students, postdocs, and
                faculty building real science together.
              </p>

              <div id="sign-in" className="mt-6 scroll-mt-20 sm:mt-8 lg:max-w-md">
                <SignInForm variant="landing" showFirebaseNotice={false} />
              </div>

              <OrDivider />

              <Link to={ROUTES.register} className="block w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full !rounded-full border-zinc-400/80 py-3 text-base font-semibold text-fg-muted hover:text-fg dark:border-zinc-500"
                >
                  New to THE ERUDIS? Join now
                </Button>
              </Link>
            </div>

            <div className="mt-10 lg:mt-0">
              <LandingHeroVisual compact />
            </div>
          </div>
        </section>

        <LandingVisionSections />
      </main>
    </div>
  );
}
