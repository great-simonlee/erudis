import { skipFirebase } from '../../config/flags';

export function FeedPage() {
  return (
    <div>
      {skipFirebase && (
        <p className="mb-6 rounded-card border border-border bg-surface-card px-4 py-3 text-xs text-fg-subtle">
          Preview mode (no Firebase). Turn on auth later by setting{' '}
          <code className="text-fg-muted">skipFirebase</code> to <code className="text-fg-muted">false</code> in{' '}
          <code className="text-fg-muted">src/config/flags.ts</code>.
        </p>
      )}
      <h1 className="font-display text-2xl text-fg">Home</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Your feed will appear here in Phase 2.
      </p>
    </div>
  );
}
