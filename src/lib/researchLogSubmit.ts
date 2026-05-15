import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { calculateStreak } from '../utils/researchStreak';
import type { ResearchGraph, ResearchLogType } from '../types';

export type NewResearchLogInput = {
  userId: string;
  date: string;
  type: ResearchLogType;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
};

export async function submitResearchLog(
  db: Firestore,
  input: NewResearchLogInput
): Promise<string> {
  const created = await addDoc(collection(db, 'research_logs'), {
    userId: input.userId,
    date: input.date,
    type: input.type,
    title: input.title.trim(),
    content: input.content.trim(),
    isPublic: input.isPublic,
    tags: input.tags,
    createdAt: serverTimestamp(),
  });

  await runTransaction(db, async (tx) => {
    const gref = doc(db, 'research_graph', input.userId);
    const g = await tx.get(gref);
    const prev: string[] = g.exists()
      ? ((g.data() as ResearchGraph).loggedDates ?? [])
      : [];
    const dates = Array.from(new Set([...prev, input.date])).sort();
    const stats = calculateStreak(dates);
    tx.set(
      gref,
      {
        loggedDates: dates,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalLogDays: stats.totalLogDays,
        last30DayCount: stats.last30DayCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  return created.id;
}
