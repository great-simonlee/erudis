import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/timeAgo';

function IconBell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 1 0-12 0v5H4v2h16v-2z"
      />
    </svg>
  );
}

type NotificationBellProps = {
  uid: string | undefined;
  compact?: boolean;
};

export function NotificationBell({ uid, compact }: NotificationBellProps) {
  const { items, loading, unreadCount } = useNotifications(uid);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const markRead = async (notifId: string) => {
    if (!uid || !db || !firebaseReady) return;
    try {
      await updateDoc(doc(db, 'notifications', uid, 'items', notifId), {
        isRead: true,
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 text-fg-muted hover:text-fg ${compact ? '' : ''}`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-0.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-card border border-border bg-surface-card shadow-xl ${
            compact ? '' : 'md:right-0'
          }`}
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-medium text-fg">Notifications</p>
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {loading && (
              <li className="px-3 py-4 text-xs text-fg-subtle">Loading…</li>
            )}
            {!loading && items.length === 0 && (
              <li className="px-3 py-4 text-xs text-fg-subtle">No notifications yet.</li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  to={
                    n.type === 'resonate' && n.postId
                      ? `${ROUTES.feed}#post-${n.postId}`
                      : n.type === 'follow' && n.fromUserId
                        ? ROUTES.profile(n.fromUserId)
                        : ROUTES.feed
                  }
                  className="block px-3 py-2.5 text-left text-xs hover:bg-surface-raised"
                  onClick={() => {
                    void markRead(n.id);
                    setOpen(false);
                  }}
                >
                  <p className={`text-fg ${n.isRead ? 'opacity-70' : 'font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-[10px] text-fg-subtle">
                    {formatTimeAgo(n.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
