import { useEffect, useState } from 'react';
import { db, firebaseReady } from '../../lib/firebase';
import {
  removeCareerEntry,
  saveUserWorkExperiences,
  upsertCareerEntry,
} from '../../lib/profileCareerFirestore';
import { useToast } from '../../contexts/ToastContext';
import { newProfileEntryId, parseOptionalYear } from '../../utils/profileForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { TextArea } from '../ui/TextArea';
import { ProfileFormModal } from './ProfileFormModal';
import type { ProfileWorkExperience } from '../../types';

type WorkExperienceFormModalProps = {
  open: boolean;
  entry: ProfileWorkExperience | null;
  workExperiences: ProfileWorkExperience[];
  userId: string;
  onClose: () => void;
  onSaved: (workExperiences: ProfileWorkExperience[]) => void;
};

export function WorkExperienceFormModal({
  open,
  entry,
  workExperiences,
  userId,
  onClose,
  onSaved,
}: WorkExperienceFormModalProps) {
  const { showToast } = useToast();
  const isEdit = entry != null;
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? '');
    setOrganization(entry?.organization ?? '');
    setLocation(entry?.location ?? '');
    setStartYear(entry?.startYear != null ? String(entry.startYear) : '');
    setEndYear(entry?.endYear != null ? String(entry.endYear) : '');
    setIsCurrent(entry?.ongoing === true);
    setDescription(entry?.description ?? '');
  }, [open, entry]);

  const persist = async (next: ProfileWorkExperience[]) => {
    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }
    await saveUserWorkExperiences(db, userId, next);
    onSaved(next);
  };

  const save = async () => {
    if (!title.trim()) {
      showToast('Job title is required.', 'error');
      return;
    }
    if (!organization.trim()) {
      showToast('Organization is required.', 'error');
      return;
    }
    const parsedStart = parseOptionalYear(startYear);
    const parsedEnd = isCurrent ? null : parseOptionalYear(endYear);
    if (startYear.trim() && parsedStart == null) {
      showToast('Enter a valid start year (1900–2100).', 'error');
      return;
    }
    if (!isCurrent && endYear.trim() && parsedEnd == null) {
      showToast('Enter a valid end year (1900–2100).', 'error');
      return;
    }
    if (parsedStart != null && parsedEnd != null && parsedEnd < parsedStart) {
      showToast('End year cannot be before start year.', 'error');
      return;
    }

    const payload: ProfileWorkExperience = {
      id: entry?.id ?? newProfileEntryId(),
      title: title.trim(),
      organization: organization.trim(),
      location: location.trim() || undefined,
      startYear: parsedStart,
      endYear: isCurrent ? null : parsedEnd,
      ongoing: isCurrent,
      description: description.trim() || undefined,
    };

    setSaving(true);
    try {
      const next = upsertCareerEntry(workExperiences, payload);
      await persist(next);
      showToast(isEdit ? 'Work experience updated.' : 'Work experience added.', 'success');
      onClose();
    } catch {
      showToast('Could not save work experience.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!entry || !window.confirm('Remove this work experience?')) return;
    setDeleting(true);
    try {
      const next = removeCareerEntry(workExperiences, entry.id);
      await persist(next);
      showToast('Work experience removed.', 'success');
      onClose();
    } catch {
      showToast('Could not remove work experience.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProfileFormModal
      open={open}
      title={isEdit ? 'Edit work experience' : 'Add work experience'}
      onClose={onClose}
      onSubmit={() => void save()}
      submitLabel={isEdit ? 'Save changes' : 'Add experience'}
      saving={saving || deleting}
      deleteAction={
        isEdit ? (
          <Button
            type="button"
            variant="ghost"
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            disabled={saving || deleting}
            onClick={() => void remove()}
          >
            {deleting ? 'Removing…' : 'Delete'}
          </Button>
        ) : undefined
      }
    >
      <div>
        <Label htmlFor="work-title">Title *</Label>
        <Input
          id="work-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5"
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="work-org">Organization *</Label>
        <Input
          id="work-org"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="mt-1.5"
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="work-location">Location</Label>
        <Input
          id="work-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1.5"
          maxLength={120}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="work-start">Start year</Label>
          <Input
            id="work-start"
            inputMode="numeric"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="work-end">End year</Label>
          <Input
            id="work-end"
            inputMode="numeric"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            disabled={isCurrent}
            className="mt-1.5 disabled:opacity-50"
          />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => {
            setIsCurrent(e.target.checked);
            if (e.target.checked) setEndYear('');
          }}
          className="rounded border-border text-brand focus:ring-brand"
        />
        I currently work here
      </label>
      <div>
        <Label htmlFor="work-desc">Description</Label>
        <TextArea
          id="work-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1.5 min-h-[100px]"
          maxLength={2000}
        />
      </div>
    </ProfileFormModal>
  );
}
