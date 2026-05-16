import { useState } from 'react';
import { firebaseReady, db } from '../../lib/firebase';
import { submitResearchLog } from '../../lib/researchLogSubmit';
import { useToast } from '../../contexts/ToastContext';
import { utcIsoDate } from '../../utils/timeAgo';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { TextArea } from '../ui/TextArea';
import type { ResearchLogType } from '../../types';

const LOG_TYPES: { id: ResearchLogType; label: string; emoji: string }[] = [
  { id: 'experiment', label: 'Experiment / data collection', emoji: '🧪' },
  { id: 'paper_review', label: 'Paper review / reading', emoji: '📄' },
  { id: 'idea', label: 'Idea / hypothesis', emoji: '💡' },
  { id: 'result', label: 'Result / analysis', emoji: '📊' },
  { id: 'writing', label: 'Writing', emoji: '✍️' },
  { id: 'other', label: 'Other', emoji: '📌' },
];

type ResearchLogModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  fruitShapeId?: string;
  onSaved: () => void;
};

export function ResearchLogModal({
  open,
  onClose,
  userId,
  fruitShapeId,
  onSaved,
}: ResearchLogModalProps) {
  const { showToast } = useToast();
  const [date, setDate] = useState(() => utcIsoDate());
  const [type, setType] = useState<ResearchLogType>('experiment');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags((x) => [...x, t]);
    setTagInput('');
  };

  const save = async () => {
    if (!title.trim()) {
      showToast('Title is required.', 'error');
      return;
    }
    if (content.trim().length < 50) {
      showToast('Content must be at least 50 characters.', 'error');
      return;
    }
    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }
    setSaving(true);
    try {
      await submitResearchLog(db, {
        userId,
        date,
        type,
        fruitShapeId,
        title: title.trim(),
        content: content.trim(),
        isPublic,
        tags,
      });
      showToast('Research log saved! 🔥 Keep your streak going', 'success');
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setDate(utcIsoDate());
      onSaved();
      onClose();
    } catch {
      showToast('Could not save log. Check Firestore rules.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-border bg-surface-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="log-modal-title" className="font-display text-xl text-fg">
            Research log
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-fg-muted hover:bg-surface-raised hover:text-fg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="log-date">Date</Label>
            <Input
              id="log-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-fg">Log type</legend>
            <div className="mt-2 space-y-2">
              {LOG_TYPES.map((lt) => (
                <label
                  key={lt.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:bg-surface-raised/60"
                >
                  <input
                    type="radio"
                    name="logtype"
                    value={lt.id}
                    checked={type === lt.id}
                    onChange={() => setType(lt.id)}
                    className="border-border text-brand focus:ring-brand"
                  />
                  <span>
                    {lt.emoji} {lt.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="log-title">Title</Label>
            <Input
              id="log-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="mt-1.5"
            />
            <p className="mt-1 text-right text-xs text-fg-subtle">{title.length}/100</p>
          </div>
          <div>
            <Label htmlFor="log-content">Content (Markdown)</Label>
            <TextArea
              id="log-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1.5 min-h-[160px]"
            />
            <p className="mt-1 text-right text-xs text-fg-subtle">{content.length} chars (min 50)</p>
          </div>
          <div>
            <Label htmlFor="log-tags">Tags (Enter)</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTags((x) => x.filter((y) => y !== t))}
                  className="rounded-full border border-border px-2 py-0.5 text-xs"
                >
                  {t} ×
                </button>
              ))}
            </div>
            <Input
              id="log-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="mt-2"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-fg">Visibility</legend>
            <div className="mt-2 flex gap-4 text-sm text-fg-muted">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="logvis"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="border-border text-brand focus:ring-brand"
                />
                Public 🌍
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="logvis"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="border-border text-brand focus:ring-brand"
                />
                Private 🔒
              </label>
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save log'}
          </Button>
        </div>
      </div>
    </div>
  );
}
