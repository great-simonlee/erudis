import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { seedDummyPostsForUser } from './seedDummyFeedData';

export type SeedReviewParams = {
  uid: string;
  institutionId: string | null;
  institutionName: string | null;
  primaryLabId: string | null;
  labIds: string[];
};

const DEMO_LOGS = [
  {
    date: '2026-01-08',
    type: 'experiment' as const,
    title: 'Pilot run: instrument calibration checklist',
    content: 'Documented baseline noise floor after recalibration. Sharing notes for the lab wiki.',
    isPublic: true,
    tags: ['methods', 'lab'],
  },
  {
    date: '2026-01-12',
    type: 'idea' as const,
    title: 'Cross-lab replication swap',
    content: 'Proposal: exchange one figure worth of experiments with a partner lab next month.',
    isPublic: true,
    tags: ['collaboration'],
  },
  {
    date: '2026-01-18',
    type: 'writing' as const,
    title: 'Methods section — reviewer round 1',
    content: 'Tightened statistical reporting per committee feedback (demo text).',
    isPublic: false,
    tags: ['thesis'],
  },
];

const DEMO_PAPERS = [
  {
    title: 'Attention flows on citation graphs (demo)',
    authors: ['You', 'A. Colleague'],
    doi: null,
    abstract: 'Synthetic abstract for UI review only — not a real publication.',
    publicationYear: 2025,
    venue: 'Demo Workshop',
    url: null,
    arxivId: '2401.00001',
    resonateCount: 3,
    viewCount: 42,
    labId: null,
  },
  {
    title: 'Reproducible pipelines for small-team ML labs',
    authors: ['You'],
    doi: '10.0000/demo.2025.1',
    abstract: 'Placeholder DOI for staging UI.',
    publicationYear: 2024,
    venue: 'Journal of Demo Data',
    url: 'https://example.com/paper-demo',
    arxivId: null,
    resonateCount: 7,
    viewCount: 110,
    labId: null,
  },
];

/**
 * Seeds rich demo content for the signed-in user (papers, logs, graph, feed posts, jobs)
 * so Phases 1–4 can be reviewed in one account. Safe to run multiple times (adds more docs).
 */
export async function seedPlatformReviewForCurrentUser(
  db: Firestore,
  params: SeedReviewParams
): Promise<void> {
  const { uid, institutionId, institutionName, primaryLabId, labIds } = params;

  await setDoc(
    doc(db, 'research_graph', uid),
    {
      loggedDates: ['2026-01-02', '2026-01-05', '2026-01-08', '2026-01-12', '2026-01-18'],
      currentStreak: 5,
      longestStreak: 14,
      totalLogDays: 52,
      last30DayCount: 9,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  let batch = writeBatch(db);
  let n = 0;
  const commitIfNeeded = async () => {
    if (n >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      n = 0;
    }
  };

  for (const log of DEMO_LOGS) {
    const ref = doc(collection(db, 'research_logs'));
    batch.set(ref, {
      ...log,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    n++;
    await commitIfNeeded();
  }

  for (const paper of DEMO_PAPERS) {
    const ref = doc(collection(db, 'papers'));
    batch.set(ref, {
      ...paper,
      addedBy: uid,
      createdAt: serverTimestamp(),
    });
    n++;
    await commitIfNeeded();
  }

  if (n > 0) {
    await batch.commit();
  }

  await seedDummyPostsForUser(db, {
    authorId: uid,
    institutionId,
    labId: primaryLabId,
    feedUserIds: [uid],
  });

  await addDoc(collection(db, 'jobs'), {
    labId: null,
    postedByUserId: uid,
    title: 'Demo: Postdoctoral Researcher — Computational Neuroscience',
    description:
      '**Staging copy only.**\n\n- Independent project design\n- Open science norms\n- Mentoring from senior grads\n\nApply via the link below (example).',
    active: true,
    positionType: 'Postdoc',
    department: 'Demo Department',
    location: 'Boston, MA',
    remote: false,
    institutionName: institutionName ?? 'Demo University',
    applicationUrl: 'https://example.com/apply-demo',
    deadline: '2026-12-31',
    sponsored: false,
    createdAt: serverTimestamp(),
  });

  const candidateLab = primaryLabId ?? labIds[0];
  if (candidateLab) {
    const labSnap = await getDoc(doc(db, 'labs', candidateLab));
    const data = labSnap.data() as { piId?: string } | undefined;
    if (labSnap.exists() && data?.piId === uid) {
      await addDoc(collection(db, 'jobs'), {
        labId: candidateLab,
        postedByUserId: uid,
        title: 'Demo: PhD student — ML for science',
        description:
          '**Lab-linked demo listing.**\n\nJoin our group working at the interface of ML and scientific discovery.',
        active: true,
        positionType: 'PhD Position',
        department: 'Demo Lab',
        location: 'Remote-friendly',
        remote: true,
        institutionName: institutionName ?? null,
        applicationUrl: null,
        deadline: null,
        sponsored: false,
        createdAt: serverTimestamp(),
      });
    }
  }
}
