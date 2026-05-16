import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { coffeeChatFromDoc, loadCoffeeChatsForUser } from '../../lib/coffeeChats';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import { Button } from '../../components/ui/Button';
import type { CoffeeChat, User } from '../../types';

type Row = CoffeeChat & { id: string; peer?: User | null; direction: 'in' | 'out' };

export function MessagesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const loadErrorShown = useRef(false);

  const load = useCallback(async () => {
    if (!user?.uid || !firebaseReady || !db) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fs = db;
      const docs = await loadCoffeeChatsForUser(fs, user.uid);
      const map = new Map<string, Row>();
      const peerIds = new Set<string>();

      for (const d of docs) {
        const data = coffeeChatFromDoc(d);
        const direction: 'in' | 'out' = data.toUserId === user.uid ? 'in' : 'out';
        if (map.has(d.id)) continue;
        peerIds.add(direction === 'in' ? data.fromUserId : data.toUserId);
        map.set(d.id, {
          ...data,
          direction,
        });
      }

      const peers = new Map<string, User | null>();
      for (const pid of Array.from(peerIds)) {
        const u = await getDoc(doc(db, 'users', pid));
        peers.set(
          pid,
          u.exists() ? ({ uid: u.id, ...(u.data() as Omit<User, 'uid'>) } as User) : null
        );
      }

      const merged = Array.from(map.values()).map((r) => {
        const peerId = r.direction === 'in' ? r.fromUserId : r.toUserId;
        return { ...r, peer: peers.get(peerId) ?? null };
      });
      merged.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      setRows(merged);
      loadErrorShown.current = false;
    } catch (err) {
      setRows([]);
      if (!loadErrorShown.current) {
        loadErrorShown.current = true;
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('index')) {
          showToast('Coffee chats need a Firestore index — run npm run deploy:indexes.', 'error');
        } else {
          showToast('Could not load coffee chat requests.', 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps -- showToast stable

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (chatId: string, status: 'accepted' | 'declined') => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'coffee_chats', chatId), { status });
      showToast(status === 'accepted' ? 'Accepted.' : 'Declined.', 'success');
      void load();
    } catch {
      showToast('Could not update request.', 'error');
    }
  };

  const title = useMemo(
    () => (
      <div>
        <h1 className="font-display text-2xl text-fg">Messages</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Coffee chat requests appear here. Full direct messaging will arrive in a later phase.
        </p>
      </div>
    ),
    []
  );

  if (!user) {
    return (
      <div>
        {title}
        <p className="mt-4 text-sm text-fg-muted">Sign in to view requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title}

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card border border-border bg-surface-raised/40" />
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <p className="text-sm text-fg-muted">No coffee chat threads yet.</p>
      )}

      <ul className="space-y-3">
        {!loading &&
          rows.map((r) => {
            const peerName = r.peer?.name ?? 'Member';
            const peerUid = r.direction === 'in' ? r.fromUserId : r.toUserId;
            return (
              <li key={r.id} className="rounded-card border border-border bg-surface-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-fg-subtle">
                      {r.direction === 'in' ? 'Incoming' : 'Sent'} · {r.status}
                    </p>
                    <Link
                      to={ROUTES.profile(peerUid)}
                      className="mt-1 block text-sm font-semibold text-fg hover:text-brand"
                    >
                      {peerName}
                    </Link>
                    <p className="mt-1 text-xs text-fg-subtle">{formatTimeAgo(r.createdAt)}</p>
                    {r.message ? (
                      <p className="mt-2 text-sm text-fg-muted">&ldquo;{r.message}&rdquo;</p>
                    ) : null}
                  </div>
                  {r.direction === 'in' && r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => void respond(r.id, 'declined')}>
                        Decline
                      </Button>
                      <Button type="button" onClick={() => void respond(r.id, 'accepted')}>
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
