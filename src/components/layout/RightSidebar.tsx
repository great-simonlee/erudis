export function RightSidebar() {
  const trending = [
    { id: '1', title: 'Sparse attention for long-context reasoning', resonates: 128 },
    { id: '2', title: 'Reproducibility notes: protein folding benchmarks', resonates: 96 },
    { id: '3', title: 'Lab notebook: weekly synthesis log', resonates: 74 },
  ];
  const people = [
    { id: 'a', name: 'Dr. A. Okonkwo', role: 'Professor' },
    { id: 'b', name: 'M. Chen', role: 'PhD' },
    { id: 'c', name: 'J. Rivera', role: 'Postdoc' },
  ];
  const jobs = [
    { id: 'j1', title: 'Postdoc — computational neuroscience', org: 'Midwest U' },
    { id: 'j2', title: 'Research scientist — ML for science', org: 'Coastal Lab' },
  ];

  return (
    <aside className="hidden h-full min-h-0 w-[300px] shrink-0 overflow-y-auto border-l border-border bg-surface px-4 py-6 xl:flex xl:flex-col">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Trending this week
        </h2>
        <ol className="mt-4 space-y-4">
          {trending.map((p, i) => (
            <li key={p.id}>
              <p className="text-[11px] text-fg-subtle">{i + 1}</p>
              <p className="mt-1 text-sm leading-snug text-fg-soft">{p.title}</p>
              <p className="mt-1 text-xs text-brand">{p.resonates} resonates</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Who to follow
        </h2>
        <ul className="mt-4 space-y-3">
          {people.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-2 border-b border-border pb-3 last:border-0"
            >
              <div>
                <p className="text-sm text-fg">{u.name}</p>
                <p className="text-xs text-fg-subtle">{u.role}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded border border-border px-2 py-1 text-xs text-fg-soft hover:border-brand hover:text-fg"
              >
                Follow
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Open positions
        </h2>
        <ul className="mt-4 space-y-4">
          {jobs.map((j) => (
            <li key={j.id}>
              <p className="text-sm text-fg-soft">{j.title}</p>
              <p className="mt-1 text-xs text-fg-subtle">{j.org}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
