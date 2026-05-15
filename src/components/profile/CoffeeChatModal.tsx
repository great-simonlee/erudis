import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { TextArea } from '../ui/TextArea';

type CoffeeChatModalProps = {
  open: boolean;
  onClose: () => void;
  fromUserId: string;
  toUserId: string;
  targetName: string;
  targetInstitution: string;
};

export function CoffeeChatModal({
  open,
  onClose,
  fromUserId,
  toUserId,
  targetName,
  targetInstitution,
}: CoffeeChatModalProps) {
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!firebaseReady || !db) {
      showToast('Firebase is not available.', 'error');
      return;
    }
    const msg = message.trim();
    if (msg.length > 500) {
      showToast('Message is too long (max 500 characters).', 'error');
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'coffee_chats'), {
        fromUserId,
        toUserId,
        message: msg,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      showToast('Coffee chat request sent.', 'success');
      setMessage('');
      onClose();
    } catch {
      showToast('Could not send request.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coffee-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card border border-border bg-surface-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="coffee-title" className="font-display text-lg text-fg">
            Request a coffee chat
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-fg-muted hover:bg-surface-raised"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-2 text-sm text-fg-muted">
          {targetName}
          {targetInstitution ? ` · ${targetInstitution}` : ''}
        </p>
        <div className="mt-5">
          <Label htmlFor="coffee-msg">What would you like to discuss? (optional)</Label>
          <TextArea
            id="coffee-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            className="mt-1.5 min-h-[100px]"
            placeholder="e.g. Your lab’s work on …"
          />
          <p className="mt-1 text-right text-xs text-fg-subtle">{message.length}/500</p>
        </div>
        <p className="mt-3 text-xs text-fg-subtle">
          Default duration: 30 minutes. The recipient can accept or decline from Messages.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={sending} onClick={() => void submit()}>
            {sending ? 'Sending…' : 'Send request'}
          </Button>
        </div>
      </div>
    </div>
  );
}
