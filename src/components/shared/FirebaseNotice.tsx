import { skipFirebase } from '../../config/flags';
import { firebaseConfigured, firebaseReady } from '../../lib/firebase';

export function FirebaseNotice() {
  if (skipFirebase) return null;
  if (firebaseReady) return null;

  if (!firebaseConfigured) {
    return (
      <div
        className="mb-6 rounded-card border border-amber-900/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
        role="status"
      >
        <p className="font-medium text-amber-50">Firebase is not configured</p>
        <p className="mt-1 text-amber-100/90">
          Copy <code className="rounded bg-surface-raised px-1 py-0.5 text-fg-muted">.env.example</code> to{' '}
          <code className="rounded bg-surface-raised px-1 py-0.5 text-fg-muted">.env.local</code> and paste your
          project keys from the Firebase console (Project settings → Your apps). Then
          restart <code className="rounded bg-surface-raised px-1 py-0.5 text-fg-muted">npm start</code>.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mb-6 rounded-card border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-100"
      role="alert"
    >
      <p className="font-medium text-red-50">Firebase failed to initialize</p>
      <p className="mt-1 text-red-100/90">
        Check that your <code className="rounded bg-surface-raised px-1 py-0.5 text-fg-muted">REACT_APP_*</code>{' '}
        values match the Firebase web app config. See the browser console for details.
      </p>
    </div>
  );
}
