import { Link } from 'react-router-dom';
import { RESEARCH_FIELD_CATALOG } from '../../constants';
import { ROUTES } from '../../constants';
import { Button } from '../ui/Button';

const FEATURED_FIELDS = [
  'AI/ML',
  'Computer Science',
  'Neuroscience',
  'Biochemistry',
  'Physics',
  'Chemistry',
  'Economics',
  'Psychology',
  'Bioinformatics',
  'Mechanical Engineering',
  'Public Health',
  'Materials Science',
] as const;

const PILLARS = [
  {
    title: 'Research ritual',
    body: 'Daily logs, streaks, and lab-note stories turn quiet progress into visible momentum—without turning science into performance theater.',
  },
  {
    title: 'Verified labs & institutions',
    body: 'Profiles, memberships, and school pages are tied to real academic identity—so you know who you are learning from and collaborating with.',
  },
  {
    title: 'Papers, jobs & discovery',
    body: 'Share preprints, find openings, and explore work across fields in one feed built for researchers—not generic social noise.',
  },
] as const;

const AUDIENCE = [
  { label: 'Find your lab or PI', hint: 'Join existing groups or start a new lab page.' },
  { label: 'Track your research ritual', hint: 'Log experiments, ideas, and writing in public or private.' },
  { label: 'Discover papers & opportunities', hint: 'Filter by field, institution, and role.' },
] as const;

function SectionShell({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`border-t border-border px-4 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function LandingVisionSections() {
  const extraFields = RESEARCH_FIELD_CATALOG.filter(
    (f) => !FEATURED_FIELDS.includes(f as (typeof FEATURED_FIELDS)[number])
  ).slice(0, 8);

  return (
    <>
      <SectionShell className="bg-surface-raised/60">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">What is THE ERUDIS?</p>
        <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl leading-tight text-fg sm:text-4xl">
              Next-gen network for people who do the work.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted">
              THE ERUDIS is a verified academic platform for students, postdocs, PIs, and labs. Combine
              identity-checked profiles, research logs, papers, and lab pages—so collaboration starts from
              trust, not guesswork.
            </p>
            <p className="mt-4 max-w-xl text-sm text-fg-subtle">
              No fake listings. No anonymous hype. Just transparent profiles, institutions, and research
              activity you can actually follow.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {['Verified identity', 'Lab & institution pages', 'Scam-resistant hiring'].map((tag) => (
              <li
                key={tag}
                className="rounded-xl border border-border bg-surface-card px-4 py-3 text-sm font-medium text-fg"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Three pillars</p>
        <h2 className="mt-3 font-display text-3xl text-fg sm:text-4xl">Why THE ERUDIS?</h2>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Three pillars that make research life more visible, more connected, and easier to navigate.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <li
              key={p.title}
              className="rounded-2xl border border-border bg-surface-card p-6 shadow-sm"
            >
              <h3 className="font-display text-xl text-fg">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell className="bg-surface-raised/40">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 className="font-display text-3xl text-fg sm:text-4xl">
              Explore research across disciplines
            </h2>
            <p className="mt-4 text-fg-muted">
              From AI/ML to public health—follow fields, labs, and people working on problems you care about.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...FEATURED_FIELDS, ...extraFields].map((field) => (
              <span
                key={field}
                className="rounded-full border border-border bg-surface-card px-4 py-2 text-sm text-fg-soft transition-colors hover:border-brand/40 hover:text-brand"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl text-fg sm:text-4xl">Who is THE ERUDIS for?</h2>
            <p className="mt-4 text-fg-muted">
              Anyone navigating academic life—undergrad researchers, graduate students, postdocs, faculty,
              and lab staff building something worth sharing.
            </p>
          </div>
          <ul className="space-y-3">
            {AUDIENCE.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-[#f3f2ef] px-5 py-4 dark:bg-surface-raised"
              >
                <div>
                  <p className="font-medium text-fg">{item.label}</p>
                  <p className="mt-1 text-sm text-fg-muted">{item.hint}</p>
                </div>
                <span className="shrink-0 text-fg-subtle" aria-hidden>
                  ›
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell className="border-t-0 bg-gradient-to-b from-brand/10 to-brand/5">
        <div className="text-center">
          <h2 className="font-display text-3xl text-fg sm:text-4xl">
            Join your lab, classmates, and collaborators
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-fg-muted">
            Create a free account with your institutional email and start your research ritual today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={ROUTES.register}>
              <Button className="!rounded-full px-8 py-3 text-base">Get started — it&apos;s free</Button>
            </Link>
            <a href="#sign-in">
              <Button variant="outline" className="!rounded-full px-8 py-3 text-base">
                Sign in
              </Button>
            </a>
          </div>
        </div>
      </SectionShell>

      <footer className="border-t border-border bg-surface px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-subtle">
            © {new Date().getFullYear()} THE ERUDIS · Share the intelligence, shape the world
          </p>
          <nav className="flex flex-wrap gap-4 text-sm text-fg-muted">
            <Link to={ROUTES.register} className="hover:text-brand">
              Join
            </Link>
            <Link to={ROUTES.login} className="hover:text-brand">
              Sign in
            </Link>
            <Link to={ROUTES.pricing} className="hover:text-brand">
              Pricing
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
