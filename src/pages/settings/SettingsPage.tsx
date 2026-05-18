import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useTheme, type ThemePreference } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { LabNoteFruitShapePicker } from '../../components/profile/LabNoteFruitShapePicker';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import {
  LAB_NOTE_FRUIT_SHAPES,
  resolveFruitShapeId,
  type LabNoteFruitShapeId,
} from '../../constants/labNotePortraits';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { db, firebaseReady } from '../../lib/firebase';
import { SignOutConfirmSheet } from '../../components/profile/SignOutConfirmSheet';
import { useLogOut } from '../../hooks/useLogOut';
import { enableDummyFeedSeed } from '../../config/flags';
import { seedPlatformReviewForCurrentUser } from '../../dev/seedPlatformReviewData';

const THEME_OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Match device light or dark mode.' },
  { value: 'light', label: 'Light', hint: 'Always use light theme.' },
  { value: 'dark', label: 'Dark', hint: 'Always use dark theme.' },
];

export function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { logOut, signingOut } = useLogOut();
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);

  const savedShape = resolveFruitShapeId(profile?.labNoteStoryPortrait);
  const [draftShape, setDraftShape] = useState<LabNoteFruitShapeId>(savedShape);
  const [savingFruit, setSavingFruit] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  useEffect(() => {
    setDraftShape(savedShape);
  }, [savedShape]);

  const fruitDirty = draftShape !== savedShape;
  const activeSaved = LAB_NOTE_FRUIT_SHAPES.find((f) => f.id === savedShape);

  const saveFruitShape = async () => {
    if (!user?.uid || !db || !firebaseReady) return;
    setSavingFruit(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        labNoteStoryPortrait: draftShape,
      });
      showToast('Lab-note story fruit saved.', 'success');
    } catch {
      showToast('Could not save fruit choice.', 'error');
    } finally {
      setSavingFruit(false);
    }
  };

  const loadSampleProfileData = async () => {
    if (!user?.uid || !profile || !db || !firebaseReady) return;
    setLoadingSample(true);
    try {
      await seedPlatformReviewForCurrentUser(db, {
        uid: user.uid,
        institutionId: profile.institutionId,
        institutionName: profile.institutionName,
        primaryLabId: profile.primaryLabId,
        labIds: profile.labIds ?? [],
      });
      showToast('Sample profile data loaded. Open your profile to view it.', 'success');
    } catch {
      showToast('Could not load sample data. Check Firestore rules.', 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-fg">Settings</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Account and appearance. More settings will land here over time.
      </p>

      {enableDummyFeedSeed ? (
        <section className="mt-10 rounded-card border border-border bg-surface-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Sample profile data
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Load demo research logs, educations, and work experiences on your account for UI
            review. Also seeds papers, posts, and a research graph streak.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loadingSample}
              onClick={() => void loadSampleProfileData()}
            >
              {loadingSample ? 'Loading…' : 'Load sample data'}
            </Button>
            <Link to={ROUTES.profile(user?.uid ?? '')} className="text-sm text-brand hover:underline">
              View profile
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-10 rounded-card border border-border bg-surface-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
          Lab-note story
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          Pick one pixel fruit for your profile grid. Weekday lab notes paint it in — this
          is a one-time setup, not something you switch on the profile page.
        </p>
        {activeSaved && (
          <p className="mt-2 text-sm text-fg">
            Current: {activeSaved.emoji} {activeSaved.name}
          </p>
        )}

        <div className="mt-6">
          <LabNoteFruitShapePicker
            value={draftShape}
            onChange={setDraftShape}
            disabled={savingFruit}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={!fruitDirty || savingFruit}
            onClick={() => void saveFruitShape()}
          >
            {savingFruit ? 'Saving…' : 'Save fruit'}
          </Button>
          {fruitDirty && (
            <button
              type="button"
              className="text-sm text-fg-muted hover:text-fg"
              onClick={() => setDraftShape(savedShape)}
            >
              Reset
            </button>
          )}
          <Link to={ROUTES.profile(user?.uid ?? '')} className="text-sm text-brand hover:underline">
            View on profile
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-card border border-border bg-surface-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
          Appearance
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          Choose how THE ERUDIS looks on this device. You can still use the quick toggle in
          the sidebar or mobile header.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ThemeToggle />
        </div>

        <fieldset className="mt-8 space-y-3">
          <legend className="sr-only">Theme preference</legend>
          {THEME_OPTIONS.map((opt) => (
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

      <section className="mt-8 rounded-card border border-border bg-surface-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
          Account
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          Signed in as {profile?.email ?? user?.email ?? 'your account'}.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400"
            disabled={signingOut}
            onClick={() => setSignOutConfirmOpen(true)}
          >
            Log out
          </Button>
        </div>
      </section>

      <SignOutConfirmSheet
        open={signOutConfirmOpen}
        signingOut={signingOut}
        onClose={() => setSignOutConfirmOpen(false)}
        onConfirm={() => void logOut()}
      />
    </div>
  );
}
