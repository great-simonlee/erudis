import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { TextArea } from '../../components/ui/TextArea';
import { managesInstitution } from '../../lib/institutionAccess';
import {
  getInstitution,
  listLabsAtInstitution,
  listUsersAtInstitution,
  updateInstitutionMemberRole,
  updateInstitutionProfile,
} from '../../lib/institutions';
import { roleLabel } from '../../utils/roleLabels';
import type { Institution, Lab, User, UserRole } from '../../types';

const ASSIGNABLE_ROLES: UserRole[] = [
  'professor',
  'phd',
  'postdoc',
  'researcher',
  'research_scientist',
  'industry_researcher',
  'institution_admin',
];

export function InstitutionAdminPage() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const allowed = useMemo(
    () => !!(institutionId && managesInstitution(profile, institutionId)),
    [profile, institutionId]
  );

  const load = useCallback(async () => {
    if (!institutionId || !firebaseReady || !db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fs = db;
      const inst = await getInstitution(fs, institutionId);
      if (!inst) {
        setInstitution(null);
        return;
      }
      setInstitution(inst);
      setName(inst.name);
      setDescription(inst.description ?? '');
      setWebsiteUrl(inst.websiteUrl ?? '');
      const labRows = await listLabsAtInstitution(fs, institutionId, inst.name);
      setLabs(labRows);
      setPeople(await listUsersAtInstitution(fs, institutionId));
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!institutionId) {
    return <p className="text-sm text-fg-muted">Institution not found.</p>;
  }

  if (!loading && !allowed) {
    return <Navigate to={ROUTES.institution(institutionId)} replace />;
  }

  const saveInstitution = async () => {
    if (!db || !institutionId) return;
    setSaving(true);
    try {
      await updateInstitutionProfile(db, institutionId, {
        name,
        description,
        websiteUrl,
      });
      setInstitution((i) =>
        i
          ? {
              ...i,
              name: name.trim(),
              description: description.trim(),
              websiteUrl: websiteUrl.trim(),
            }
          : i
      );
      showToast('Institution profile updated.', 'success');
    } catch {
      showToast('Could not save institution.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (uid: string, role: UserRole) => {
    if (!db) return;
    try {
      await updateInstitutionMemberRole(db, uid, role);
      setPeople((rows) => rows.map((u) => (u.uid === uid ? { ...u, role } : u)));
      showToast('Role updated.', 'success');
    } catch {
      showToast('Could not update role.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-12 animate-pulse rounded-card border border-border bg-surface-raised/50" />
        <div className="h-64 animate-pulse rounded-card border border-border bg-surface-raised/50" />
      </div>
    );
  }

  if (!institution) {
    return <p className="text-sm text-fg-muted">Institution not found.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand">Administration</p>
          <h1 className="font-display text-2xl text-fg">{institution.name}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Manage labs, faculty, students, and researchers at your institution.
          </p>
        </div>
        <Link
          to={ROUTES.institution(institutionId)}
          className="text-sm text-brand hover:underline"
        >
          View public profile
        </Link>
      </div>

      <section className="space-y-4 rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Institution details</h2>
        <p className="text-xs text-fg-muted">
          Logo and cover are edited on the{' '}
          <Link to={ROUTES.institution(institutionId)} className="text-brand hover:underline">
            institution profile
          </Link>
          .
        </p>
        <div>
          <Label htmlFor="inst-name">Name</Label>
          <Input
            id="inst-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="inst-desc">Description</Label>
          <TextArea
            id="inst-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 min-h-[100px]"
          />
        </div>
        <div>
          <Label htmlFor="inst-web">Website</Label>
          <Input
            id="inst-web"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="mt-1.5"
            placeholder="https://…"
          />
        </div>
        <Button type="button" disabled={saving} onClick={() => void saveInstitution()}>
          {saving ? 'Saving…' : 'Save details'}
        </Button>
      </section>

      <section className="rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Research labs ({labs.length})</h2>
        <p className="mt-1 text-xs text-fg-muted">
          Open lab settings to edit members, invites, and lab profile media.
        </p>
        {labs.length === 0 ? (
          <p className="mt-4 text-sm text-fg-subtle">No labs at this institution yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {labs.map((lab) => (
              <li key={lab.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-fg">{lab.name}</p>
                  <p className="text-xs text-fg-subtle">
                    {lab.memberIds.length} members · PI{' '}
                    <Link to={ROUTES.profile(lab.piId)} className="text-brand hover:underline">
                      view profile
                    </Link>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={ROUTES.lab(lab.id)}
                    className="rounded-card border border-border px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-raised"
                  >
                    View lab
                  </Link>
                  <Link
                    to={ROUTES.labSettings(lab.id)}
                    className="rounded-card border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
                  >
                    Lab settings
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">People ({people.length})</h2>
        <p className="mt-1 text-xs text-fg-muted">
          Assign roles for professors, students, postdocs, and researchers at your school.
        </p>
        {people.length === 0 ? (
          <p className="mt-4 text-sm text-fg-subtle">No members linked to this institution yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {people.map((person) => (
              <li
                key={person.uid}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    to={ROUTES.profile(person.uid)}
                    className="font-medium text-fg hover:text-brand"
                  >
                    {person.name}
                  </Link>
                  <p className="text-xs text-fg-subtle">{person.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`role-${person.uid}`} className="sr-only">
                    Role for {person.name}
                  </label>
                  <select
                    id={`role-${person.uid}`}
                    value={person.role}
                    disabled={person.uid === profile?.uid}
                    onChange={(e) => void changeRole(person.uid, e.target.value as UserRole)}
                    className="rounded-card border border-border bg-surface px-2 py-1.5 text-sm text-fg"
                    title={person.uid === profile?.uid ? 'You cannot change your own role here' : undefined}
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {roleLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
