import { Link } from 'react-router-dom';
import { RESEARCH_FIELD_CATALOG } from '../../constants';
import { ROUTES } from '../../constants';
import { LandingFooter } from './LandingFooter';
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

const CROSS_FIELD_EXPLORE = [
  {
    title: 'Papers',
    body: 'Discover preprints and publications from other disciplines—filter by field, venue, and year without leaving your feed.',
  },
  {
    title: 'Studies & methods',
    body: 'See how neighboring fields frame similar questions—benchmarks, protocols, and study designs worth borrowing.',
  },
  {
    title: 'Experiences',
    body: 'Read research logs and lab stories from scholars in neuroscience, economics, engineering, and beyond.',
  },
] as const;

const PILLARS = [
  {
    title: 'Cross-field discovery',
    body: 'Step outside your silo. Follow papers, posts, and people in fields you do not work in every day—but might learn from.',
  },
  {
    title: 'Share the intelligence',
    body: 'Publish your work, logs, and lab context so other researchers can see how your field thinks—not just your citations.',
  },
  {
    title: 'Shape the world',
    body: 'Verified identity, institutions, and labs—so the ideas you encounter are tied to real scholars, not anonymous noise.',
  },
] as const;

const AUDIENCE = [
  {
    label: 'Explore outside your field',
    hint: 'Papers, studies, and experiences from disciplines you do not study every day.',
  },
  {
    label: 'Share from your discipline',
    hint: 'Make your lab’s methods and findings legible to curious minds elsewhere.',
  },
  {
    label: 'Connect with real scholars',
    hint: 'Follow labs, message collaborators, and find opportunities with verified profiles.',
  },
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Share the Intelligence, Shape the World
        </p>
        <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl leading-tight text-fg sm:text-4xl">
              Intelligence travels further when fields meet.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted">
              THE ERUDIS is where researchers share papers, studies, and lived research experiences
              across disciplines—so a biologist can learn from an economist, and a computer scientist
              can see how a chemist runs an experiment.
            </p>
            <p className="mt-4 max-w-xl text-sm text-fg-subtle">
              Your home field stays central. Everything else is one scroll away—curated by people,
              not algorithms shouting for attention.
            </p>
          </div>
          <ul className="grid gap-3">
            {CROSS_FIELD_EXPLORE.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-border bg-surface-card px-4 py-4"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Why join</p>
        <h2 className="mt-3 font-display text-3xl text-fg sm:text-4xl">
          Built for curious researchers
        </h2>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Three ways THE ERUDIS turns cross-disciplinary curiosity into something you can act on.
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
              Every field, one place to explore
            </h2>
            <p className="mt-4 text-fg-muted">
              Jump from AI/ML to public health, from economics to materials science—follow the papers,
              studies, and experiences that catch your eye, even when they are not in your syllabus.
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
              Students, postdocs, faculty, and lab staff who want their own work seen—and who stay
              curious about how other fields think.
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Share the Intelligence, Shape the World
          </p>
          <h2 className="mt-3 font-display text-3xl text-fg sm:text-4xl">
            Start exploring—and contributing—today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-fg-muted">
            Create a free account with your institutional email. Follow other fields, share your own
            papers and research ritual, and see what clarity looks like from the outside in.
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

      <LandingFooter />
    </>
  );
}
