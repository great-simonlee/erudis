import { useEffect, useState, type ReactNode } from 'react';
import { db, firebaseReady } from '../../lib/firebase';
import {
  removeCareerEntry,
  saveUserEducations,
  upsertCareerEntry,
} from '../../lib/profileCareerFirestore';
import { useToast } from '../../contexts/ToastContext';
import {
  EDUCATION_DEGREE_OPTIONS,
  EDUCATION_DEGREE_OTHER,
  educationDegreeFromForm,
  resolveEducationDegreeForForm,
} from '../../constants/educationDegrees';
import { newProfileEntryId, parseOptionalYear } from '../../utils/profileForm';
import { FormField } from '../ui/FormField';
import { FormSelect } from '../ui/FormSelect';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { ProfileFormModal } from './ProfileFormModal';
import { SchoolLogoPlaceholder } from './SchoolLogoPlaceholder';
import type { ProfileEducation } from '../../types';

type EducationFormModalProps = {
  open: boolean;
  entry: ProfileEducation | null;
  educations: ProfileEducation[];
  userId: string;
  onClose: () => void;
  onSaved: (educations: ProfileEducation[]) => void;
};

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-surface-raised/35 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{title}</h3>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function EducationFormModal({
  open,
  entry,
  educations,
  userId,
  onClose,
  onSaved,
}: EducationFormModalProps) {
  const { showToast } = useToast();
  const isEdit = entry != null;
  const [school, setSchool] = useState('');
  const [degreeSelect, setDegreeSelect] = useState('');
  const [degreeOther, setDegreeOther] = useState('');
  const [field, setField] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSchool(entry?.school ?? '');
    const degreeForm = resolveEducationDegreeForForm(entry?.degree);
    setDegreeSelect(degreeForm.select);
    setDegreeOther(degreeForm.other);
    setField(entry?.field ?? '');
    setStartYear(entry?.startYear != null ? String(entry.startYear) : '');
    setEndYear(entry?.endYear != null ? String(entry.endYear) : '');
    setIsCurrent(entry?.ongoing === true);
    setDescription(entry?.description ?? '');
  }, [open, entry]);

  const persist = async (next: ProfileEducation[]) => {
    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }
    await saveUserEducations(db, userId, next);
    onSaved(next);
  };

  const save = async () => {
    if (!school.trim()) {
      showToast('School is required.', 'error');
      return;
    }
    if (degreeSelect === EDUCATION_DEGREE_OTHER && !degreeOther.trim()) {
      showToast('Enter your degree or pick a preset.', 'error');
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

    const payload: ProfileEducation = {
      id: entry?.id ?? newProfileEntryId(),
      school: school.trim(),
      degree: educationDegreeFromForm(degreeSelect, degreeOther),
      field: field.trim() || undefined,
      startYear: parsedStart,
      endYear: isCurrent ? null : parsedEnd,
      ongoing: isCurrent,
      description: description.trim() || undefined,
    };

    setSaving(true);
    try {
      const next = upsertCareerEntry(educations, payload);
      await persist(next);
      showToast(isEdit ? 'Education updated.' : 'Education added.', 'success');
      onClose();
    } catch {
      showToast('Could not save education.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!entry || !window.confirm('Remove this education entry?')) return;
    setDeleting(true);
    try {
      const next = removeCareerEntry(educations, entry.id);
      await persist(next);
      showToast('Education removed.', 'success');
      onClose();
    } catch {
      showToast('Could not remove education.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProfileFormModal
      open={open}
      title={isEdit ? 'Edit education' : 'Add education'}
      subtitle="Share where you studied and what you focused on."
      onClose={onClose}
      onSubmit={() => void save()}
      submitLabel={isEdit ? 'Save' : 'Add education'}
      saving={saving || deleting}
      deleteAction={
        isEdit ? (
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => void remove()}
            className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            {deleting ? 'Removing…' : 'Delete entry'}
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <FormSection title="Institution">
          <div className="flex gap-3">
            <SchoolLogoPlaceholder school={school || 'School'} className="mt-0.5" />
            <FormField label="School" htmlFor="edu-school" required className="min-w-0 flex-1">
              <Input
                id="edu-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Northeastern University"
                maxLength={200}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Program">
          <FormField label="Degree" htmlFor="edu-degree">
            <FormSelect
              id="edu-degree"
              value={degreeSelect}
              onChange={(e) => setDegreeSelect(e.target.value)}
            >
              <option value="">Select degree</option>
              {EDUCATION_DEGREE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={EDUCATION_DEGREE_OTHER}>Other</option>
            </FormSelect>
          </FormField>
          {degreeSelect === EDUCATION_DEGREE_OTHER ? (
            <FormField label="Custom degree" htmlFor="edu-degree-other">
              <Input
                id="edu-degree-other"
                value={degreeOther}
                onChange={(e) => setDegreeOther(e.target.value)}
                placeholder="e.g. B.B.A."
                maxLength={120}
              />
            </FormField>
          ) : null}
          <FormField label="Field of study" htmlFor="edu-field">
            <Input
              id="edu-field"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g. Marketing, Computer Science"
              maxLength={120}
            />
          </FormField>
        </FormSection>

        <FormSection title="Timeline">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start year" htmlFor="edu-start">
              <Input
                id="edu-start"
                inputMode="numeric"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="2018"
              />
            </FormField>
            <FormField label="End year" htmlFor="edu-end">
              <Input
                id="edu-end"
                inputMode="numeric"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="2022"
                disabled={isCurrent}
              />
            </FormField>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isCurrent}
            onClick={() => {
              setIsCurrent((v) => {
                if (!v) setEndYear('');
                return !v;
              });
            }}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
              isCurrent
                ? 'border-brand/35 bg-brand/10'
                : 'border-border bg-surface-card hover:border-brand/20'
            }`}
          >
            <span className="text-sm font-medium text-fg">I currently study here</span>
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isCurrent ? 'bg-brand' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isCurrent ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </FormSection>

        <FormField
          label="Description"
          htmlFor="edu-desc"
          hint="Optional — highlights, thesis topic, or activities."
        >
          <TextArea
            id="edu-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[88px]"
            maxLength={2000}
          />
        </FormField>
      </div>
    </ProfileFormModal>
  );
}
