import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { CoffeeChat } from '../types';

function isMissingIndexError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : '';
  const msg = err instanceof Error ? err.message : String(err);
  return code === 'failed-precondition' || msg.includes('requires an index');
}

async function querySide(
  db: Firestore,
  field: 'toUserId' | 'fromUserId',
  uid: string,
  ordered: boolean
): Promise<QueryDocumentSnapshot[]> {
  const base = collection(db, 'coffee_chats');
  const qy = ordered
    ? query(base, where(field, '==', uid), orderBy('createdAt', 'desc'), limit(40))
    : query(base, where(field, '==', uid), limit(40));
  const snap = await getDocs(qy);
  return snap.docs;
}

export async function loadCoffeeChatsForUser(
  db: Firestore,
  uid: string
): Promise<QueryDocumentSnapshot[]> {
  try {
    const [incoming, outgoing] = await Promise.all([
      querySide(db, 'toUserId', uid, true),
      querySide(db, 'fromUserId', uid, true),
    ]);
    return [...incoming, ...outgoing];
  } catch (err) {
    if (!isMissingIndexError(err)) throw err;
    const [incoming, outgoing] = await Promise.all([
      querySide(db, 'toUserId', uid, false),
      querySide(db, 'fromUserId', uid, false),
    ]);
    return [...incoming, ...outgoing];
  }
}

export function coffeeChatFromDoc(
  d: QueryDocumentSnapshot
): CoffeeChat & { id: string } {
  return { id: d.id, ...(d.data() as Omit<CoffeeChat, 'id'>) };
}
