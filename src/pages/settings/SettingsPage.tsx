import { useTheme, type ThemePreference } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Match device light or dark mode.' },
  { value: 'light', label: 'Light', hint: 'Always use light theme.' },
  { value: 'dark', label: 'Dark', hint: 'Always use dark theme.' },
];

export function SettingsPage() {
  const { preference, setPreference } = useTheme();

  return (
    <div>
      <h1 className="font-display text-2xl text-fg">Settings</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Account and appearance. More settings will land here over time.
      </p>

      <section className="mt-10 rounded-card border border-border bg-surface-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
          Appearance
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          Choose how THE ERUDIS looks on this device. You can still use the quick
          toggle in the sidebar or mobile header.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ThemeToggle />
        </div>

        <fieldset className="mt-8 space-y-3">
          <legend className="sr-only">Theme preference</legend>
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer gap-3 rounded-card border px-4 py-3 transition-colors ${
                preference === opt.value
                  ? 'border-brand bg-brand/5'
                  : 'border-border hover:border-fg-subtle/40'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={opt.value}
                checked={preference === opt.value}
                onChange={() => setPreference(opt.value)}
                className="mt-1 accent-brand"
              />
              <span>
                <span className="block text-sm font-medium text-fg">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-fg-muted">{opt.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>
    </div>
  );
}
