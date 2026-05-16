import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { linkCurrentUserToDemoEcosystem } from './linkDemoEcosystem';
import type { PostType, PostVisibility } from '../types';

export type SeedReviewParams = {
  uid: string;
  institutionId: string | null;
  institutionName: string | null;
  primaryLabId: string | null;
  labIds: string[];
};

const ACCOUNT_SAMPLE_POSTS: {
  title: string;
  content: string;
  type: PostType;
  tags: string[];
  researchArea: string;
  resonateCount?: number;
  commentCount?: number;
  viewCount?: number;
}[] = [
  {
    title: 'Lab wiki: weekly sync template',
    type: 'update',
    researchArea: 'Computer Science',
    tags: ['lab-culture', 'process'],
    content:
      'We use a **30-minute** standing agenda: wins, blockers, one deep dive. Notes live in the shared doc for newcomers.',
    resonateCount: 4,
    commentCount: 1,
    viewCount: 62,
  },
  {
    title: 'Benchmark note: document your hardware profile',
    type: 'result',
    researchArea: 'AI/ML',
    tags: ['benchmarks', 'reproducibility'],
    content:
      'Latency moved **12%** under CPU throttle — posting configs next to scores helped us debug.',
    resonateCount: 6,
    viewCount: 98,
  },
  {
    title: 'Looking for surveys on causal discovery',
    type: 'question',
    researchArea: 'Statistics',
    tags: ['causality', 'reading'],
    content:
      'Prefer **post-2020** work covering continuous and mixed data. What did your reading group use?',
    resonateCount: 2,
    commentCount: 3,
    viewCount: 44,
  },
];

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

async function seedAccountPosts(
  db: Firestore,
  params: { authorId: string; institutionId: string | null; labId: string | null }
): Promise<void> {
  const { authorId, institutionId } = params;
  const baseMs = Date.now();
  let batch = writeBatch(db);
  let ops = 0;

  const commitIfNeeded = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  for (let i = 0; i < ACCOUNT_SAMPLE_POSTS.length; i++) {
    const spec = ACCOUNT_SAMPLE_POSTS[i]!;
    const postRef = doc(collection(db, 'posts'));
    const createdAt = Timestamp.fromMillis(baseMs - (i + 1) * 3_600_000);
    const visibility: PostVisibility = 'public';

    batch.set(postRef, {
      authorId,
      labId: null,
      institutionId,
      type: spec.type,
      title: spec.title,
      content: spec.content,
      attachments: [],
      tags: spec.tags,
      researchArea: spec.researchArea,
      resonateCount: spec.resonateCount ?? 0,
      viewCount: spec.viewCount ?? 0,
      commentCount: spec.commentCount ?? 0,
      visibility,
      isPendingApproval: false,
      createdAt,
      updatedAt: createdAt,
    });
    ops++;
    await commitIfNeeded();

    batch.set(doc(db, 'feed', authorId, 'items', postRef.id), {
      postId: postRef.id,
      authorId,
      createdAt,
    });
    ops++;
    await commitIfNeeded();
  }

  if (ops > 0) await batch.commit();
}

/**
 * Seeds sample content for the signed-in user (papers, logs, graph, a few posts, jobs)
 * and links to the Admin demo ecosystem when present.
 */
export async function seedPlatformReviewForCurrentUser(
  db: Firestore,
  params: SeedReviewParams
): Promise<{ followed: number; feedItems: number }> {
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

  await seedAccountPosts(db, {
    authorId: uid,
    institutionId,
    labId: primaryLabId,
  });

  await addDoc(collection(db, 'jobs'), {
    labId: null,
    postedByUserId: uid,
    title: 'Postdoctoral Researcher — Computational Neuroscience',
    description:
      '**Staging copy only.**\n\n- Independent project design\n- Open science norms\n- Mentoring from senior grads',
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
        title: 'PhD student — ML for science',
        description:
          '**Lab-linked listing.**\n\nJoin our group working at the interface of ML and scientific discovery.',
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

  const link = await linkCurrentUserToDemoEcosystem(db, uid);
  return link;
}
