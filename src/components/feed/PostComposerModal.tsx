import { useEffect, useMemo, useState } from 'react';
import { firebaseReady, db } from '../../lib/firebase';
import { RESEARCH_FIELD_CATALOG } from '../../constants';
import { createPostAndFanOut } from '../../lib/createPost';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { TextArea } from '../ui/TextArea';
import type { PostType, PostVisibility } from '../../types';

const POST_TYPES: { id: PostType; label: string }[] = [
  { id: 'update', label: 'Update' },
  { id: 'result', label: 'Result' },
  { id: 'paper_review', label: 'Paper review' },
  { id: 'idea', label: 'Idea' },
  { id: 'milestone', label: 'Milestone' },
  { id: 'paper', label: 'Paper' },
  { id: 'question', label: 'Question' },
];

const COMPOSER_HEADINGS: Partial<Record<PostType, string>> = {
  update: 'Share an update',
  paper: 'Share a paper',
  idea: 'Share an idea',
  result: 'Share a result',
  question: 'Ask a question',
  milestone: 'Share a milestone',
  paper_review: 'Paper review',
};

type PostComposerModalProps = {
  open: boolean;
  onClose: () => void;
  authorId: string;
  institutionId: string | null;
  primaryLabId: string | null;
  memberLabs: { id: string; name: string }[];
  onPosted: () => void;
  initialType?: PostType;
};

export function PostComposerModal({
  open,
  onClose,
  authorId,
  institutionId,
  primaryLabId,
  memberLabs,
  onPosted,
  initialType,
}: PostComposerModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('update');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [researchArea, setResearchArea] = useState(RESEARCH_FIELD_CATALOG[0] ?? '');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [postLabId, setPostLabId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialType) setType(initialType);
    if (primaryLabId) setPostLabId(primaryLabId);
    else if (memberLabs.length === 1) setPostLabId(memberLabs[0].id);
    else setPostLabId(null);
  }, [open, initialType, primaryLabId, memberLabs]);

  const labIdForPost = useMemo(() => {
    if (visibility !== 'members_only') return null;
    return postLabId ?? primaryLabId ?? memberLabs[0]?.id ?? null;
  }, [primaryLabId, postLabId, visibility, memberLabs]);

  if (!open) return null;

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.length >= 5 || tags.includes(t)) return;
    setTags((x) => [...x, t]);
    setTagInput('');
  };

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required.', 'error');
      return;
    }
    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createPostAndFanOut(db, {
        authorId,
        title: title.trim(),
        content: content.trim(),
        type,
        tags,
        researchArea,
        visibility,
        labId: labIdForPost,
        institutionId,
      });
      showToast('Post published.', 'success');
      setTitle('');
      setContent('');
      setTags([]);
      setType('update');
      setVisibility('public');
      onPosted();
      onClose();
    } catch {
      showToast('Could not publish post. Check Firestore rules.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-border bg-surface-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="composer-title" className="font-display text-xl text-fg">
            {COMPOSER_HEADINGS[type] ?? 'New post'}
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
            <Label htmlFor="ptitle">Title</Label>
            <Input
              id="ptitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="pcontent">Content (Markdown supported)</Label>
            <TextArea
              id="pcontent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1.5 min-h-[140px]"
              maxLength={20000}
            />
            <p className="mt-1 text-right text-xs text-fg-subtle">{content.length}/20000</p>
          </div>
          <div>
            <Label htmlFor="ptype">Post type</Label>
            <select
              id="ptype"
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="mt-1.5 w-full rounded-card border border-border bg-surface-card px-3 py-2.5 text-sm text-fg"
            >
              {POST_TYPES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="parea">Research area</Label>
            <select
              id="parea"
              value={researchArea}
              onChange={(e) => setResearchArea(e.target.value)}
              className="mt-1.5 max-h-40 w-full rounded-card border border-border bg-surface-card px-3 py-2.5 text-sm text-fg"
            >
              {RESEARCH_FIELD_CATALOG.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ptags">Tags (Enter, max 5)</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTags((x) => x.filter((y) => y !== t))}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted hover:border-red-500/50"
                >
                  {t} ×
                </button>
              ))}
            </div>
            <Input
              id="ptags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="mt-2"
              placeholder="e.g. fMRI, replication"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-fg">Visibility</legend>
            <div className="mt-2 flex flex-col gap-2">
              {(
                [
                  ['public', 'Public'],
                  ['members_only', 'Lab members only'],
                  ['private', 'Private'],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
                  <input
                    type="radio"
                    name="vis"
                    value={v}
                    checked={visibility === v}
                    onChange={() => setVisibility(v)}
                    className="border-border text-brand focus:ring-brand"
                  />
                  {label}
                </label>
              ))}
            </div>
            {visibility === 'members_only' && memberLabs.length > 1 && (
              <div>
                <Label htmlFor="plab">Post as lab</Label>
                <select
                  id="plab"
                  value={postLabId ?? ''}
                  onChange={(e) => setPostLabId(e.target.value || null)}
                  className="mt-1.5 w-full rounded-card border border-border bg-surface-card px-3 py-2.5 text-sm text-fg"
                >
                  {memberLabs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {visibility === 'members_only' && !labIdForPost && (
              <p className="mt-2 text-xs text-amber-400">
                Link a lab to your profile to publish members-only posts.
              </p>
            )}
          </fieldset>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={submitting} onClick={() => void submit()}>
            {submitting ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
}
