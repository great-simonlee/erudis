import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { RESEARCH_FIELD_CATALOG, ROUTES } from '../../constants';
import { slugify } from '../../constants/institutions';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { TextArea } from '../../components/ui/TextArea';

function firestoreInstitutionIdForLab(inst: {
  id: string | null;
  name: string;
}): string {
  if (inst.id) return inst.id;
  const s = slugify(inst.name);
  return s ? `custom:${s}` : 'custom:institution';
}

export function LabCreatePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isProfessor = profile?.role === 'professor';

  const institution = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.institutionId,
      name: profile.institutionName ?? '',
    };
  }, [profile]);

  const toggleArea = (a: string) => {
    setAreas((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= 5) return prev;
      return [...prev, a];
    });
  };

  const submit = async () => {
    if (!user || !profile || !db || !firebaseReady) {
      showToast('Sign in required.', 'error');
      return;
    }
    if (!isProfessor) {
      showToast('Only professors can create a lab.', 'error');
      return;
    }
    const n = name.trim();
    if (n.length < 2) {
      showToast('Enter a lab name.', 'error');
      return;
    }
    if (!institution?.name) {
      showToast('Complete your institution in Settings first.', 'error');
      return;
    }
    if (areas.length === 0) {
      showToast('Pick at least one research area.', 'error');
      return;
    }
    setSaving(true);
    try {
      const institutionId = firestoreInstitutionIdForLab({
        id: institution.id,
        name: institution.name,
      });
      const labRef = await addDoc(collection(db, 'labs'), {
        name: n,
        institutionId,
        institutionName: institution.name || null,
        department: department.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
        piId: user.uid,
        memberIds: [user.uid],
        researchAreas: areas,
        description: description.trim(),
        logoUrl: '',
        requirePostApproval: false,
        isLabPro: false,
        followers: [],
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', user.uid), {
        labIds: arrayUnion(labRef.id),
        primaryLabId: profile.primaryLabId ?? labRef.id,
      });
      showToast('Lab created.', 'success');
      navigate(ROUTES.lab(labRef.id), { replace: true });
    } catch {
      showToast('Could not create lab.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isProfessor) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl text-fg">Create a lab</h1>
        <p className="text-sm text-fg-muted">
          Lab creation is limited to professor accounts. If your role should be updated, contact
          support or finish onboarding with the correct role.
        </p>
        <Link to={ROUTES.labs} className="text-sm text-brand hover:underline">
          Back to My Labs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-fg">Create a lab</h1>
        <p className="mt-2 text-sm text-fg-muted">
          You will be the PI. Members can be added from lab settings.
        </p>
      </div>

      <div className="space-y-4 rounded-card border border-border bg-surface-card p-5">
        <div>
          <Label htmlFor="lname">Lab name</Label>
          <Input id="lname" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="labout">About</Label>
          <TextArea
            id="labout"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 min-h-[100px]"
          />
        </div>
        <div>
          <Label htmlFor="ldept">Department (optional)</Label>
          <Input id="ldept" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="lweb">Website (optional)</Label>
          <Input
            id="lweb"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="mt-1.5"
            placeholder="https://"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-fg">Research areas (up to 5)</p>
          <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {RESEARCH_FIELD_CATALOG.slice(0, 40).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleArea(a)}
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  areas.includes(a)
                    ? 'border-brand bg-brand/15 text-brand'
                    : 'border-border text-fg-muted'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.labs)}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void submit()}>
            {saving ? 'Creating…' : 'Create lab'}
          </Button>
        </div>
      </div>
    </div>
  );
}
