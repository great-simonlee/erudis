import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Firestore,
} from 'firebase/firestore';
import { db, firebaseReady } from '../lib/firebase';
import type { NotificationItem } from '../types';

const PAGE = 25;

export function useNotifications(uid: string | undefined) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const canLoad = useMemo(() => Boolean(uid && firebaseReady && db), [uid]);

  useEffect(() => {
    if (!canLoad || !uid || !db) {
      setItems([]);
      setLoading(false);
      return;
    }
    const fs: Firestore = db;
    const qy = query(
      collection(fs, 'notifications', uid, 'items'),
      orderBy('createdAt', 'desc'),
      limit(PAGE)
    );
    setLoading(true);
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows: NotificationItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NotificationItem, 'id'>),
        }));
        setItems(rows);
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [canLoad, uid]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  return { items, loading, unreadCount };
}
