import { useEffect, useState } from 'react';
import { db, firebaseReady } from '../../lib/firebase';
import {
  createProfilePaper,
  deleteProfilePaper,
  updateProfilePaper,
  type PaperWriteInput,
} from '../../lib/profilePapersFirestore';
import { useToast } from '../../contexts/ToastContext';
import { formatAuthorsList, parseAuthorsList, parseOptionalYear } from '../../utils/profileForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { TextArea } from '../ui/TextArea';
import { ProfileFormModal } from './ProfileFormModal';
import type { Paper } from '../../types';

type PaperFormModalProps = {
  open: boolean;
  paper: Paper | null;
  userId: string;
  labId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

function toWriteInput(
  title: string,
  authorsRaw: string,
  abstract: string,
  publicationYearRaw: string,
  venue: string,
  doi: string,
  url: string,
  arxivId: string,
  labId: string | null
): PaperWriteInput | null {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return null;
  const authors = parseAuthorsList(authorsRaw);
  if (authors.length === 0) return null;
  const publicationYear = parseOptionalYear(publicationYearRaw);
  if (publicationYearRaw.trim() && publicationYear == null) return null;

  return {
    title: trimmedTitle,
    authors,
    abstract: abstract.trim(),
    publicationYear,
    venue: venue.trim() || null,
    doi: doi.trim() || null,
    url: url.trim() || null,
    arxivId: arxivId.trim() || null,
    labId,
  };
}

export function PaperFormModal({
  open,
  paper,
  userId,
  labId,
  onClose,
  onSaved,
}: PaperFormModalProps) {
  const { showToast } = useToast();
  const isEdit = paper != null;
  const [title, setTitle] = useState('');
  const [authorsRaw, setAuthorsRaw] = useState('');
  const [abstract, setAbstract] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [venue, setVenue] = useState('');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [arxivId, setArxivId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(paper?.title ?? '');
    setAuthorsRaw(paper ? formatAuthorsList(paper.authors) : '');
    setAbstract(paper?.abstract ?? '');
    setPublicationYear(paper?.publicationYear != null ? String(paper.publicationYear) : '');
    setVenue(paper?.venue ?? '');
    setDoi(paper?.doi ?? '');
    setUrl(paper?.url ?? '');
    setArxivId(paper?.arxivId ?? '');
  }, [open, paper]);

  const save = async () => {
    const input = toWriteInput(
      title,
      authorsRaw,
      abstract,
      publicationYear,
      venue,
      doi,
      url,
      arxivId,
      paper?.labId ?? labId
    );
    if (!input) {
      if (!title.trim()) {
        showToast('Title is required.', 'error');
        return;
      }
      if (parseAuthorsList(authorsRaw).length === 0) {
        showToast('Add at least one author (comma-separated).', 'error');
        return;
      }
      showToast('Enter a valid publication year (1900–2100).', 'error');
      return;
    }

    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && paper) {
        await updateProfilePaper(db, paper.id, input);
        showToast('Paper updated.', 'success');
      } else {
        await createProfilePaper(db, userId, input);
        showToast('Paper added.', 'success');
      }
      onSaved();
      onClose();
    } catch {
      showToast('Could not save paper.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!paper || !window.confirm('Remove this paper from your profile?')) return;
    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }
    setDeleting(true);
    try {
      await deleteProfilePaper(db, paper.id);
      showToast('Paper removed.', 'success');
      onSaved();
      onClose();
    } catch {
      showToast('Could not remove paper.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProfileFormModal
      open={open}
      title={isEdit ? 'Edit paper' : 'Add paper'}
      onClose={onClose}
      onSubmit={() => void save()}
      submitLabel={isEdit ? 'Save changes' : 'Add paper'}
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
        <Label htmlFor="paper-title">Title *</Label>
        <Input
          id="paper-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5"
          maxLength={500}
        />
      </div>
      <div>
        <Label htmlFor="paper-authors">Authors *</Label>
        <Input
          id="paper-authors"
          value={authorsRaw}
          onChange={(e) => setAuthorsRaw(e.target.value)}
          placeholder="Jane Doe, John Smith"
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-fg-subtle">Separate names with commas.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="paper-year">Publication year</Label>
          <Input
            id="paper-year"
            inputMode="numeric"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="paper-venue">Venue</Label>
          <Input
            id="paper-venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="mt-1.5"
            maxLength={200}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="paper-doi">DOI</Label>
        <Input
          id="paper-doi"
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="paper-url">URL</Label>
          <Input
            id="paper-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="paper-arxiv">arXiv ID</Label>
          <Input
            id="paper-arxiv"
            value={arxivId}
            onChange={(e) => setArxivId(e.target.value)}
            placeholder="2401.00001"
            className="mt-1.5"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="paper-abstract">Abstract</Label>
        <TextArea
          id="paper-abstract"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          className="mt-1.5 min-h-[120px]"
          maxLength={8000}
        />
      </div>
    </ProfileFormModal>
  );
}
