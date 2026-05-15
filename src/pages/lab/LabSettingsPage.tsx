import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { TextArea } from '../../components/ui/TextArea';
import type { Lab, LabInvite } from '../../types';

export function LabSettingsPage() {
  const { labId } = useParams<{ labId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [memberUid, setMemberUid] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [invites, setInvites] = useState<LabInvite[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!labId || !db || !firebaseReady) {
      setLab(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const L = await getDoc(doc(db, 'labs', labId));
      if (!L.exists()) {
        setLab(null);
        return;
      }
      const data: Lab = { id: L.id, ...(L.data() as Omit<Lab, 'id'>) };
      setLab(data);
      setName(data.name);
      setDescription(data.description ?? '');
      setRequireApproval(data.requirePostApproval ?? false);

      const invSnap = await getDocs(
        query(
          collection(db, 'lab_invites'),
          where('labId', '==', labId),
          orderBy('createdAt', 'desc')
        )
      );
      setInvites(
        invSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LabInvite, 'id'>),
        }))
      );
    } catch {
      setLab(null);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveLab = async () => {
    if (!labId || !db || !lab || !user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'labs', labId), {
        name: name.trim(),
        description: description.trim(),
        requirePostApproval: requireApproval,
      });
      showToast('Lab updated.', 'success');
      void load();
    } catch {
      showToast('Could not save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    const uid = memberUid.trim();
    if (!labId || !db || !uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'labs', labId), { memberIds: arrayUnion(uid) });
      setMemberUid('');
      showToast('Member added.', 'success');
      void load();
    } catch {
      showToast('Could not add member.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const createInvite = async () => {
    const em = inviteEmail.trim();
    if (!labId || !db || !user || em.length < 3) {
      showToast('Enter an email.', 'error');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'lab_invites'), {
        labId,
        invitedBy: user.uid,
        invitedEmail: em.toLowerCase(),
        invitedUid: null,
        role: 'phd',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setInviteEmail('');
      showToast('Invite recorded.', 'success');
      void load();
    } catch {
      showToast('Could not create invite.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const postJob = async () => {
    if (!labId || !db || !user) return;
    const t = jobTitle.trim();
    if (t.length < 2) {
      showToast('Job title required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        labId,
        postedByUserId: user.uid,
        title: t,
        description: jobDesc.trim(),
        active: true,
        createdAt: serverTimestamp(),
      });
      setJobTitle('');
      setJobDesc('');
      showToast('Job posted.', 'success');
    } catch {
      showToast('Could not post job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeLab = async () => {
    if (!labId || !db || !window.confirm('Delete this lab? This cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'labs', labId));
      showToast('Lab deleted.', 'info');
      navigate(ROUTES.labs, { replace: true });
    } catch {
      showToast('Could not delete lab.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-card border border-border bg-surface-raised/50" />;
  }

  if (!lab || !user || lab.piId !== user.uid) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-fg-muted">You do not have access to these settings.</p>
        <Link to={ROUTES.labs} className="text-sm text-brand hover:underline">
          My Labs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl text-fg">Lab settings</h1>
        <Link to={ROUTES.lab(labId!)} className="text-sm text-brand hover:underline">
          View lab
        </Link>
      </div>

      <section className="space-y-4 rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Profile</h2>
        <div>
          <Label htmlFor="sn">Lab name</Label>
          <Input id="sn" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sd">About</Label>
          <TextArea id="sd" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={requireApproval}
            onChange={(e) => setRequireApproval(e.target.checked)}
            className="rounded border-border text-brand"
          />
          Require PI approval for lab-tagged posts
        </label>
        <Button type="button" disabled={saving} onClick={() => void saveLab()}>
          Save changes
        </Button>
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Members</h2>
        <p className="text-xs text-fg-subtle">
          Paste a member&apos;s user id (from their profile URL). They can add the lab to their own
          profile from the lab page.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={memberUid}
            onChange={(e) => setMemberUid(e.target.value)}
            placeholder="User UID"
            className="min-w-[12rem] flex-1"
          />
          <Button type="button" variant="outline" disabled={saving} onClick={() => void addMember()}>
            Add member
          </Button>
        </div>
        <p className="text-xs text-fg-subtle">
          Current members: {lab.memberIds.length} (including PI)
        </p>
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Invites</h2>
        <div className="flex flex-wrap gap-2">
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="invitee@university.edu"
            className="min-w-[12rem] flex-1"
          />
          <Button type="button" variant="outline" disabled={saving} onClick={() => void createInvite()}>
            Log invite
          </Button>
        </div>
        <ul className="text-xs text-fg-muted">
          {invites.map((i) => (
            <li key={i.id}>
              {i.invitedEmail} — {i.status}
            </li>
          ))}
          {invites.length === 0 && <li>No pending invites logged.</li>}
        </ul>
      </section>

      <section className="space-y-3 rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Open job</h2>
        <Input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Title"
          className="mt-1"
        />
        <TextArea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Description"
          className="min-h-[80px]"
        />
        <Button type="button" variant="outline" disabled={saving} onClick={() => void postJob()}>
          Publish listing
        </Button>
      </section>

      <section className="rounded-card border border-red-500/30 bg-red-950/20 p-5">
        <h2 className="text-sm font-semibold text-red-200">Danger zone</h2>
        <Button
          type="button"
          variant="outline"
          className="mt-3 border-red-500/50 text-red-200"
          disabled={saving}
          onClick={() => void removeLab()}
        >
          Delete lab
        </Button>
      </section>
    </div>
  );
}
