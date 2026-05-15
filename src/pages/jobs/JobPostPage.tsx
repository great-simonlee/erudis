import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { RESEARCH_FIELD_CATALOG, ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { TextArea } from '../../components/ui/TextArea';

const POSITION_TYPES = [
  'Tenure-track',
  'Postdoc',
  'PhD Position',
  'Research Scientist',
  'Industry',
] as const;

export function JobPostPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [positionType, setPositionType] = useState<string>(POSITION_TYPES[0]);
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [labId, setLabId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [labOptions, setLabOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!firebaseReady || !db || !profile?.labIds?.length) {
      setLabOptions([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const rows: { id: string; name: string }[] = [];
      for (const id of profile.labIds) {
        const s = await getDoc(doc(db, 'labs', id));
        if (s.exists()) {
          const d = s.data() as { name?: string; piId?: string };
          if (d.piId === user?.uid) rows.push({ id, name: d.name ?? 'Lab' });
        }
      }
      if (!cancelled) setLabOptions(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.labIds, user?.uid]);

  const canPost =
    profile &&
    (profile.role === 'professor' ||
      profile.role === 'institution_admin' ||
      profile.role === 'research_scientist');

  const submit = async () => {
    if (!user || !profile || !db || !firebaseReady) return;
    if (!canPost) {
      showToast('Posting is limited to professor and institution-type accounts.', 'error');
      return;
    }
    const t = title.trim();
    const desc = description.trim();
    if (t.length < 4) {
      showToast('Enter a position title.', 'error');
      return;
    }
    if (desc.length < 50) {
      showToast('Description should be at least 50 characters.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const useLab = Boolean(labId && labOptions.some((l) => l.id === labId));
      const ref = await addDoc(collection(db, 'jobs'), {
        labId: useLab ? labId : null,
        postedByUserId: user.uid,
        title: t,
        description: desc,
        active: true,
        positionType,
        department: department.trim() || null,
        location: location.trim() || null,
        remote,
        institutionName: profile.institutionName ?? null,
        applicationUrl: applicationUrl.trim() || null,
        deadline: deadline.trim() || null,
        sponsored: false,
        createdAt: serverTimestamp(),
      });
      showToast('Position published.', 'success');
      navigate(ROUTES.job(ref.id), { replace: true });
    } catch {
      showToast('Could not publish. Check Firestore rules.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canPost) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl text-fg">Post a position</h1>
        <p className="text-sm text-fg-muted">
          Professor and institution accounts can list openings. Complete onboarding with an
          appropriate role, or ask your department admin.
        </p>
        <Link to={ROUTES.jobs} className="text-sm text-brand hover:underline">
          Back to positions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl text-fg">Post a position</h1>
        <Link to={ROUTES.jobs} className="text-sm text-brand hover:underline">
          Cancel
        </Link>
      </div>

      <div className="space-y-4 rounded-card border border-border bg-surface-card p-5">
        <div>
          <Label htmlFor="jt">Title</Label>
          <Input id="jt" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="jpt">Position type</Label>
          <select
            id="jpt"
            value={positionType}
            onChange={(e) => setPositionType(e.target.value)}
            className="mt-1.5 w-full rounded-card border border-border bg-surface-card px-3 py-2.5 text-sm text-fg"
          >
            {POSITION_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="jdept">Department</Label>
          <Input id="jdept" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="jloc">Location</Label>
          <Input id="jloc" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" />
        </div>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="rounded border-border text-brand"
          />
          Remote possible
        </label>
        {labOptions.length > 0 && (
          <div>
            <Label htmlFor="jlab">Link to your lab (optional)</Label>
            <select
              id="jlab"
              value={labId}
              onChange={(e) => setLabId(e.target.value)}
              className="mt-1.5 w-full rounded-card border border-border bg-surface-card px-3 py-2.5 text-sm text-fg"
            >
              <option value="">No lab — institution-only listing</option>
              {labOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-fg-subtle">
              Lab-linked posts require you to be the PI of that lab. Names load on the job page from
              the lab document.
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="jurl">Application URL (optional)</Label>
          <Input
            id="jurl"
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            className="mt-1.5"
            placeholder="https://"
          />
        </div>
        <div>
          <Label htmlFor="jdead">Application deadline (YYYY-MM-DD, optional)</Label>
          <Input id="jdead" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="jdesc">Description (Markdown, min 50 chars)</Label>
          <TextArea
            id="jdesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 min-h-[200px]"
          />
          <p className="mt-1 text-right text-xs text-fg-subtle">{description.length} chars</p>
        </div>
        <p className="text-xs text-fg-subtle">
          Institution (display): {profile?.institutionName ?? '—'} · Field tags for search: try
          mentioning one of {RESEARCH_FIELD_CATALOG[0]}, {RESEARCH_FIELD_CATALOG[1]}… in the text.
        </p>
        <Button type="button" disabled={submitting} onClick={() => void submit()}>
          {submitting ? 'Publishing…' : 'Publish position'}
        </Button>
      </div>
    </div>
  );
}
