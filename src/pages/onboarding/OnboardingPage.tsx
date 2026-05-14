import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, firebaseReady, storage } from '../../lib/firebase';
import { RESEARCH_FIELD_CATALOG, ROUTES } from '../../constants';
import {
  INSTITUTION_CATALOG,
  filterInstitutions,
  slugify,
} from '../../constants/institutions';
import { OPEN_TO_WORK_OPTIONS } from '../../constants/openToWork';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { TextArea } from '../../components/ui/TextArea';
import { isOnboardingComplete } from '../../utils/onboardingGate';
import type { Lab, UserRole } from '../../types';

const TOTAL_STEPS = 5;
const MAX_RESEARCH_AREAS = 5;

const ONBOARDING_ROLE_OPTIONS: {
  id: Exclude<UserRole, 'pending' | 'institution_admin' | 'researcher'>;
  label: string;
}[] = [
  { id: 'professor', label: 'Professor / PI' },
  { id: 'phd', label: 'PhD Candidate' },
  { id: 'postdoc', label: 'Postdoctoral Researcher' },
  { id: 'research_scientist', label: 'Research Scientist' },
  { id: 'industry_researcher', label: 'Industry Researcher' },
];

function filterResearchFields(
  q: string,
  catalog: readonly string[]
): string[] {
  const queryLower = q.trim().toLowerCase();
  if (!queryLower) return [...catalog];
  const matches = catalog.filter((a) => a.toLowerCase().includes(queryLower));
  return matches.sort((a, b) => {
    const al = a.toLowerCase();
    const bl = b.toLowerCase();
    const as = al.startsWith(queryLower) ? 0 : 1;
    const bs = bl.startsWith(queryLower) ? 0 : 1;
    if (as !== bs) return as - bs;
    return a.localeCompare(b);
  });
}

function firestoreInstitutionIdForLab(inst: {
  id: string | null;
  name: string;
}): string {
  if (inst.id) return inst.id;
  const s = slugify(inst.name);
  return s ? `custom:${s}` : 'custom:institution';
}

export function OnboardingPage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [areas, setAreas] = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState('');

  const [role, setRole] = useState<UserRole | ''>('');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [institutionNotListed, setInstitutionNotListed] = useState(false);
  const [institutionPick, setInstitutionPick] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [customInstitution, setCustomInstitution] = useState('');

  const [labIntent, setLabIntent] = useState<
    'join_lab' | 'create_lab' | 'defer' | null
  >(null);
  const [labQuery, setLabQuery] = useState('');
  const [labResults, setLabResults] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [newLabName, setNewLabName] = useState('');
  const [newLabDescription, setNewLabDescription] = useState('');
  const [onboardingCreatedLab, setOnboardingCreatedLab] = useState<Lab | null>(
    null
  );
  const [creatingLab, setCreatingLab] = useState(false);

  const [openToWork, setOpenToWork] = useState<string[]>([]);

  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || profileLoading || !user) return;
    if (!user.emailVerified) {
      navigate(ROUTES.verifyEmail, { replace: true });
      return;
    }
    if (isOnboardingComplete(profile)) {
      navigate(ROUTES.feed, { replace: true });
    }
  }, [loading, profileLoading, user, profile, navigate]);

  useEffect(() => {
    if (step !== 3 || labIntent !== 'join_lab' || labQuery.trim().length < 2 || !db) {
      setLabResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      const fs = db;
      if (!fs) return;
      try {
        const term = labQuery.trim();
        const qy = query(
          collection(fs, 'labs'),
          orderBy('name'),
          startAt(term),
          endAt(`${term}\uf8ff`),
          limit(10)
        );
        const snap = await getDocs(qy);
        const rows: Lab[] = snap.docs.map((d) => ({
          ...(d.data() as Omit<Lab, 'id'>),
          id: d.id,
        }));
        setLabResults(rows);
      } catch {
        setLabResults([]);
      }
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- db is a module singleton
  }, [labQuery, labIntent, step]);

  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const filteredFields = useMemo(
    () => filterResearchFields(areaSearch, RESEARCH_FIELD_CATALOG),
    [areaSearch]
  );

  const filteredInstitutions = useMemo(
    () => filterInstitutions(institutionSearch, INSTITUTION_CATALOG),
    [institutionSearch]
  );

  const isProfessor = role === 'professor';

  function toggleArea(a: string) {
    setAreas((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= MAX_RESEARCH_AREAS) return prev;
      return [...prev, a];
    });
  }

  function toggleOpenToWork(id: string) {
    setOpenToWork((prev) => {
      if (id === 'nothing_now') {
        return prev.includes('nothing_now') ? [] : ['nothing_now'];
      }
      const withoutNothing = prev.filter((x) => x !== 'nothing_now');
      if (withoutNothing.includes(id)) {
        return withoutNothing.filter((x) => x !== id);
      }
      return [...withoutNothing, id];
    });
  }

  function resolveInstitution(): { id: string | null; name: string } | null {
    if (institutionNotListed) {
      const n = customInstitution.trim();
      if (n.length < 2) return null;
      return { id: null, name: n };
    }
    if (institutionPick) {
      return { id: institutionPick.id, name: institutionPick.name };
    }
    return null;
  }

  async function finish() {
    if (!user) return;
    if (areas.length === 0 || areas.length > MAX_RESEARCH_AREAS) {
      setError('Select between 1 and 5 research areas.');
      return;
    }
    if (!role || role === 'pending') {
      setError('Select your role.');
      return;
    }
    const inst = resolveInstitution();
    if (!inst) {
      setError('Select your institution or enter it if it is not listed.');
      return;
    }
    if (!labIntent) {
      setError('Choose how you want to handle lab affiliation.');
      return;
    }
    if (labIntent === 'join_lab' && !selectedLab) {
      setError('Select a lab from search, or go back and choose another option.');
      return;
    }
    if (labIntent === 'create_lab' && !selectedLab) {
      setError(
        'Finish creating your lab on step 3, or go back and choose another option.'
      );
      return;
    }
    if (openToWork.length === 0) {
      setError('Select at least one availability option.');
      return;
    }
    if (bio.length > 280) {
      setError('Bio must be 280 characters or fewer.');
      return;
    }
    if (!firebaseReady || !db) {
      setError('Firebase is not available. Check .env.local and restart the dev server.');
      return;
    }

    setSaving(true);
    setError(null);
    let avatarUrl = profile?.avatarUrl ?? '';
    if (photoFile && storage) {
      try {
        const ext = photoFile.type.includes('png') ? 'png' : 'jpeg';
        const storageRef = ref(storage, `avatars/${user.uid}/profile.${ext}`);
        await uploadBytes(storageRef, photoFile, { contentType: photoFile.type });
        avatarUrl = await getDownloadURL(storageRef);
      } catch {
        setError('Could not upload your photo. Try a smaller JPG or PNG, or skip for now.');
        setSaving(false);
        return;
      }
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        researchAreas: areas,
        role,
        institutionId: inst.id,
        institutionName: inst.name,
        labOnboardingIntent: labIntent,
        labIds: selectedLab ? [selectedLab.id] : [],
        primaryLabId: selectedLab ? selectedLab.id : null,
        openToWork,
        openToCollaborate: openToWork.includes('collaboration'),
        bio: bio.trim(),
        websiteUrl: websiteUrl.trim(),
        avatarUrl,
      });
      navigate(ROUTES.feed, { replace: true });
    } catch {
      setError('Could not save your profile. Check Firestore rules and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || profileLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-fg-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-2xl rounded-card border border-border bg-surface-card p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step === 1 && (
          <div className="mt-8">
            <h1 className="font-display text-2xl text-fg">Your research areas</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Search the catalog and pick up to {MAX_RESEARCH_AREAS} areas that
              match your work (at least one).
            </p>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
                Selected ({areas.length}/{MAX_RESEARCH_AREAS})
              </p>
              {areas.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-border bg-surface/50 px-3 py-4 text-center text-sm text-fg-subtle">
                  Nothing selected yet — tap tags below.
                </p>
              ) : (
                <div className="mt-2 flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                  {areas.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleArea(a)}
                      className="rounded-full border border-brand bg-brand/15 px-3 py-1.5 text-left text-xs text-fg transition-colors hover:bg-brand/25"
                      title="Click to remove"
                    >
                      <span className="text-fg-muted" aria-hidden>
                        ×{' '}
                      </span>
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <Label htmlFor="area-search">Search fields</Label>
              <Input
                id="area-search"
                type="search"
                autoComplete="off"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                placeholder="e.g. neuroscience, quantum, ethics…"
                className="mt-1.5"
              />
              <p className="mt-1.5 text-xs text-fg-subtle">
                {areaSearch.trim()
                  ? `${filteredFields.length} match${filteredFields.length === 1 ? '' : 'es'}`
                  : `${RESEARCH_FIELD_CATALOG.length} areas in catalog — type to filter`}
              </p>
            </div>

            <div
              className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-border bg-surface/40 p-2 sm:max-h-60"
              role="listbox"
              aria-label="Research area suggestions"
            >
              {filteredFields.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-fg-muted">
                  No catalog matches. Try a different search.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredFields.map((a) => {
                    const on = areas.includes(a);
                    const atCap = areas.length >= MAX_RESEARCH_AREAS && !on;
                    return (
                      <button
                        key={a}
                        type="button"
                        disabled={atCap}
                        onClick={() => toggleArea(a)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          on
                            ? 'border-brand bg-brand/10 text-fg'
                            : 'border-border text-fg-muted hover:border-fg-subtle'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              type="button"
              className="mt-8 w-full"
              onClick={() => {
                if (areas.length === 0) {
                  setError('Select at least one area.');
                  return;
                }
                setError(null);
                setStep(2);
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8">
            <h1 className="font-display text-2xl text-fg">Role &amp; institution</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Tell us who you are and where you are primarily affiliated.
            </p>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-fg">Role (choose one)</legend>
              <div className="mt-3 space-y-2">
                {ONBOARDING_ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-raised/60"
                  >
                    <input
                      type="radio"
                      name="onboard-role"
                      value={opt.id}
                      checked={role === opt.id}
                      onChange={() => setRole(opt.id)}
                      className="h-4 w-4 border-border text-brand focus:ring-brand"
                    />
                    <span className="text-sm text-fg-soft">{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-8">
              <Label htmlFor="inst-search">Institution</Label>
              <p className="mt-1 text-xs text-fg-subtle">
                Search the directory. If your school is missing, use the option
                below.
              </p>
              <div className="relative mt-1.5">
                <Input
                  id="inst-search"
                  type="search"
                  autoComplete="off"
                  disabled={institutionNotListed}
                  value={institutionSearch}
                  onChange={(e) => {
                    setInstitutionSearch(e.target.value);
                    setInstitutionPick(null);
                  }}
                  placeholder="e.g. MIT, Stanford, ETH…"
                  className="w-full"
                />
                {!institutionNotListed && institutionSearch.trim().length > 0 && (
                  <ul
                    role="listbox"
                    aria-label="Institution suggestions"
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border-2 border-border bg-surface-raised py-1 shadow-xl ring-1 ring-black/5 dark:border-zinc-500/80 dark:bg-zinc-950 dark:ring-white/10 dark:shadow-[0_12px_48px_rgba(0,0,0,0.75)]"
                  >
                    {filteredInstitutions.slice(0, 12).map((row) => (
                      <li key={row.id} role="option">
                        <button
                          type="button"
                          onClick={() => {
                            setInstitutionPick(row);
                            setInstitutionSearch(row.name);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                            institutionPick?.id === row.id
                              ? 'bg-brand/20 text-fg'
                              : 'text-fg-muted hover:bg-surface-card hover:text-fg-soft'
                          }`}
                        >
                          {row.name}
                        </button>
                      </li>
                    ))}
                    {filteredInstitutions.length === 0 && (
                      <li className="px-3 py-3 text-sm text-fg-muted">
                        No matches — check &quot;My institution isn&apos;t listed&quot;
                        below.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={institutionNotListed}
                onChange={(e) => {
                  const on = e.target.checked;
                  setInstitutionNotListed(on);
                  if (on) {
                    setInstitutionPick(null);
                    setInstitutionSearch('');
                  } else {
                    setCustomInstitution('');
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <span className="text-sm text-fg-muted">
                My institution isn&apos;t listed — I&apos;ll type it manually
              </span>
            </label>

            {institutionNotListed && (
              <div className="mt-3">
                <Label htmlFor="inst-custom">Institution name</Label>
                <Input
                  id="inst-custom"
                  value={customInstitution}
                  onChange={(e) => setCustomInstitution(e.target.value)}
                  placeholder="Full official name of your institution"
                  className="mt-1.5"
                />
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  if (!role) {
                    setError('Select your role.');
                    return;
                  }
                  const inst = resolveInstitution();
                  if (!inst) {
                    setError(
                      institutionNotListed
                        ? 'Enter your institution name (at least 2 characters).'
                        : 'Pick an institution from the list, or mark it as not listed.'
                    );
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8">
            <h1 className="font-display text-2xl text-fg">Lab affiliation</h1>
            <p className="mt-2 text-sm text-fg-muted">
              THE ERUDIS is built around labs. Tell us how you want to connect.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant={labIntent === 'join_lab' ? 'primary' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setLabIntent('join_lab');
                  setOnboardingCreatedLab(null);
                  setNewLabName('');
                  setNewLabDescription('');
                  setSelectedLab(null);
                  setLabQuery('');
                  setLabResults([]);
                }}
              >
                Yes, find my lab
              </Button>
              <Button
                type="button"
                variant={labIntent === 'defer' ? 'primary' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setLabIntent('defer');
                  setOnboardingCreatedLab(null);
                  setNewLabName('');
                  setNewLabDescription('');
                  setSelectedLab(null);
                  setLabQuery('');
                  setLabResults([]);
                }}
              >
                I&apos;ll set this up later
              </Button>
            </div>

            {isProfessor && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant={labIntent === 'create_lab' ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    setLabIntent('create_lab');
                    setLabQuery('');
                    setLabResults([]);
                    if (labIntent === 'join_lab' || labIntent === 'defer') {
                      setOnboardingCreatedLab(null);
                      setNewLabName('');
                      setNewLabDescription('');
                      setSelectedLab(null);
                    }
                  }}
                >
                  Create your lab
                </Button>
              </div>
            )}

            {labIntent === 'create_lab' && isProfessor && (
              <div className="mt-6 space-y-4 rounded-lg border border-border bg-surface/40 p-4">
                <p className="text-sm text-fg-muted">
                  Register your lab now. You will be listed as PI; research areas
                  match what you chose in step 1 (you can refine them later).
                </p>
                {onboardingCreatedLab && (
                  <p className="text-sm text-brand">
                    Lab &quot;{onboardingCreatedLab.name}&quot; is ready. Continue,
                    or go back to another option if you need to change course.
                  </p>
                )}
                <div>
                  <Label htmlFor="new-lab-name">Lab name</Label>
                  <Input
                    id="new-lab-name"
                    value={newLabName}
                    onChange={(e) => setNewLabName(e.target.value)}
                    placeholder="e.g. Smith Lab — Neural Computation"
                    className="mt-1.5"
                    disabled={Boolean(onboardingCreatedLab)}
                  />
                </div>
                <div>
                  <Label htmlFor="new-lab-desc">Description (optional)</Label>
                  <TextArea
                    id="new-lab-desc"
                    maxLength={800}
                    value={newLabDescription}
                    onChange={(e) => setNewLabDescription(e.target.value)}
                    placeholder="One or two sentences about your group’s focus."
                    className="mt-1.5 min-h-[88px]"
                    disabled={Boolean(onboardingCreatedLab)}
                  />
                </div>
              </div>
            )}

            {labIntent === 'join_lab' && (
              <div className="mt-6 space-y-2">
                {!isProfessor && (
                  <p className="text-sm font-medium text-fg-soft">
                    Search for your PI&apos;s lab
                  </p>
                )}
                {isProfessor && (
                  <p className="text-sm font-medium text-fg-soft">
                    Search for an existing lab you belong to
                  </p>
                )}
                <Label htmlFor="labq">Search labs</Label>
                <input
                  id="labq"
                  value={labQuery}
                  onChange={(e) => setLabQuery(e.target.value)}
                  placeholder="Start typing a lab name"
                  className="w-full rounded-card border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border bg-surface p-2">
                  {labResults.length === 0 && labQuery.trim().length >= 2 && (
                    <li className="px-2 py-2 text-xs text-fg-subtle">
                      No labs found — try another spelling or finish later from
                      settings.
                    </li>
                  )}
                  {labResults.map((lab) => (
                    <li key={lab.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedLab(lab)}
                        className={`w-full rounded px-2 py-2 text-left text-sm ${
                          selectedLab?.id === lab.id
                            ? 'bg-surface-raised text-fg'
                            : 'text-fg-muted hover:bg-surface-raised/60'
                        }`}
                      >
                        {lab.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={creatingLab}
                onClick={() => {
                  void (async () => {
                    if (!labIntent) {
                      setError('Choose one of the options above.');
                      return;
                    }
                    if (labIntent === 'join_lab' && !selectedLab) {
                      setError(
                        'Select a lab from the list, or pick another option.'
                      );
                      return;
                    }
                    if (labIntent === 'create_lab') {
                      if (onboardingCreatedLab) {
                        setSelectedLab(onboardingCreatedLab);
                        setError(null);
                        setStep(4);
                        return;
                      }
                      const labName = newLabName.trim();
                      if (labName.length < 2) {
                        setError('Enter a lab name (at least 2 characters).');
                        return;
                      }
                      const inst = resolveInstitution();
                      if (!inst || !user || !db) {
                        setError(
                          'Your institution is missing. Go back to step 2 and complete it.'
                        );
                        return;
                      }
                      setCreatingLab(true);
                      setError(null);
                      try {
                        const institutionId = firestoreInstitutionIdForLab(inst);
                        const description = newLabDescription.trim();
                        const labRef = await addDoc(collection(db, 'labs'), {
                          name: labName,
                          institutionId,
                          piId: user.uid,
                          memberIds: [user.uid],
                          researchAreas: areas,
                          description,
                          logoUrl: '',
                          requirePostApproval: false,
                          isLabPro: false,
                          followers: [],
                          createdAt: serverTimestamp(),
                        });
                        const lab: Lab = {
                          id: labRef.id,
                          name: labName,
                          institutionId,
                          piId: user.uid,
                          memberIds: [user.uid],
                          researchAreas: [...areas],
                          description,
                          logoUrl: '',
                          requirePostApproval: false,
                          isLabPro: false,
                          followers: [],
                          createdAt: null,
                        };
                        setOnboardingCreatedLab(lab);
                        setSelectedLab(lab);
                        setStep(4);
                      } catch {
                        setError(
                          'Could not create your lab. Check your connection and Firestore rules.'
                        );
                      } finally {
                        setCreatingLab(false);
                      }
                      return;
                    }
                    setError(null);
                    setStep(4);
                  })();
                }}
              >
                {creatingLab ? 'Creating lab…' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-8">
            <h1 className="font-display text-2xl text-fg">What are you open to?</h1>
            <p className="mt-2 text-sm text-fg-muted leading-relaxed">
              This helps the right people find you —
              <br />
              collaborators, hiring committees, and fellow researchers. Choose all
              that apply.
            </p>
            <div className="mt-6 space-y-2">
              {OPEN_TO_WORK_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-raised/60"
                >
                  <input
                    type="checkbox"
                    checked={openToWork.includes(opt.id)}
                    onChange={() => toggleOpenToWork(opt.id)}
                    className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-fg-soft">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  if (openToWork.length === 0) {
                    setError('Select at least one option.');
                    return;
                  }
                  setError(null);
                  setStep(5);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="mt-8">
            <h1 className="font-display text-2xl text-fg">Bio &amp; photo</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Optional details — you can update everything later in Settings.
            </p>

            <div className="mt-6">
              <Label>Profile photo (optional)</Label>
              <p className="mt-1 text-xs text-fg-subtle">
                No upload means no change yet — you can add a photo anytime in
                Settings.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  id="photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setPhotoFile(f ?? null);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-file')?.click()}
                >
                  {photoFile ? 'Change photo' : 'Upload photo'}
                </Button>
                {photoFile && (
                  <>
                    <span className="text-xs text-fg-muted">{photoFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setPhotoFile(null);
                        const el = document.getElementById(
                          'photo-file'
                        ) as HTMLInputElement | null;
                        if (el) el.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="bio">Short bio (optional, max 280 characters)</Label>
              <TextArea
                id="bio"
                maxLength={280}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I'm a PhD candidate at MIT studying…"
                className="mt-1.5"
              />
              <p className="mt-1 text-right text-xs text-fg-subtle">{bio.length}/280</p>
            </div>

            <div className="mt-6">
              <Label htmlFor="website">Personal or lab website (optional)</Label>
              <Input
                id="website"
                type="url"
                inputMode="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://"
                className="mt-1.5"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={saving}
                onClick={() => void finish()}
              >
                {saving ? 'Saving…' : 'Finish'}
              </Button>
            </div>
          </div>
        )}

        {step !== 5 && error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
