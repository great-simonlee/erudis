import {
  Timestamp,
  collection,
  doc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { Post, PostType, PostVisibility } from '../types';

type DummySpec = {
  title: string;
  content: string;
  type: PostType;
  tags: string[];
  researchArea: string;
  visibility?: PostVisibility;
  resonateCount?: number;
  commentCount?: number;
  viewCount?: number;
};

/** Curated English copy for local / staging demos (not real research). */
const DUMMY_POSTS: DummySpec[] = [
  {
    title: 'Lab wiki: how we run weekly syncs',
    type: 'update',
    researchArea: 'Computer Science',
    tags: ['lab-culture', 'process'],
    content:
      'We moved to a **30-minute** standing agenda: wins, blockers, and one deep dive. Notes live in the shared doc so newcomers can catch up.\n\nHappy to share the template if useful.',
    resonateCount: 4,
    commentCount: 1,
    viewCount: 62,
  },
  {
    title: 'Interesting failure mode on our last benchmark run',
    type: 'result',
    researchArea: 'AI/ML',
    tags: ['benchmarks', 'reproducibility'],
    content:
      'We saw a **12% swing** in latency when the evaluation box was under CPU throttle. Documenting hardware profile next to scores helped narrow it down.\n\nRaw logs are attached in the lab drive (placeholder for demo).',
    resonateCount: 9,
    commentCount: 2,
    viewCount: 140,
  },
  {
    title: 'Short notes: NeurIPS keynote themes',
    type: 'paper_review',
    researchArea: 'Neuroscience',
    tags: ['conference', 'notes'],
    content:
      'Three themes kept recurring: **evaluation beyond accuracy**, dataset governance, and open tooling for reproducible pipelines. Still digesting the panel on responsible deployment.',
    resonateCount: 6,
    commentCount: 0,
    viewCount: 88,
  },
  {
    title: 'Hypothesis: coupling graph structure with attention sparsity',
    type: 'idea',
    researchArea: 'Artificial Intelligence',
    tags: ['graphs', 'hypothesis'],
    content:
      'What if we **bias** attention patterns using the graph Laplacian so long-range hops are cheap only when the graph supports them? Might be wrong — logging here for feedback.',
    resonateCount: 11,
    commentCount: 3,
    viewCount: 201,
  },
  {
    title: 'Submitted the revised chapter to the thesis committee',
    type: 'milestone',
    researchArea: 'Computational Biology',
    tags: ['thesis', 'writing'],
    content:
      'Revision focused on clearer motivation for the wet-lab validation section. Next milestone: integrate reviewer comments from the methods chapter.',
    resonateCount: 18,
    commentCount: 5,
    viewCount: 95,
  },
  {
    title: 'Preprint dropped — feedback welcome',
    type: 'paper',
    researchArea: 'Physics',
    tags: ['preprint', 'open-science'],
    content:
      'We posted a draft on **arXiv** (demo text only). Main result is a simpler bound under weaker assumptions than our earlier workshop version. Comments here or by email are appreciated.',
    resonateCount: 22,
    commentCount: 4,
    viewCount: 310,
  },
  {
    title: 'Looking for a good survey on causal discovery under confounding',
    type: 'question',
    researchArea: 'Statistics',
    tags: ['causality', 'reading'],
    content:
      'Prefer something **post-2020** that covers both continuous and mixed data. What did your reading group use last term?',
    resonateCount: 3,
    commentCount: 7,
    viewCount: 74,
  },
  {
    title: 'Winter term office hours moved to Thursdays',
    type: 'update',
    researchArea: 'Economics',
    tags: ['teaching', 'announcement'],
    content:
      'Same room, **15:00–17:00**. If the door is locked, ping me on THE ERUDIS messages once that ships — for now email works.',
    resonateCount: 1,
    commentCount: 0,
    viewCount: 41,
  },
];

export type SeedDummyFeedParams = {
  authorId: string;
  institutionId: string | null;
  labId: string | null;
  /** Each uid gets `feed/{uid}/items/{postId}` for every seeded post (include `authorId` for home feed). */
  feedUserIds: string[];
};

/**
 * Writes dummy `posts` and matching `feed/.../items` docs as the given author.
 * Staggers `createdAt` so the feed orders in a natural way.
 */
export async function seedDummyPostsForUser(
  db: Firestore,
  params: SeedDummyFeedParams
): Promise<string[]> {
  const { authorId, institutionId, labId, feedUserIds } = params;
  const recipients = Array.from(new Set(feedUserIds.filter(Boolean)));
  if (recipients.length === 0) {
    throw new Error('seedDummyPostsForUser: feedUserIds must include at least one uid');
  }

  const baseMs = Date.now();
  const createdIds: string[] = [];
  let batch = writeBatch(db);
  let ops = 0;

  const commitIfNeeded = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  for (let i = 0; i < DUMMY_POSTS.length; i++) {
    const spec = DUMMY_POSTS[i]!;
    const postRef = doc(collection(db, 'posts'));
    const postId = postRef.id;
    const createdAt = Timestamp.fromMillis(baseMs - (i + 1) * 3_600_000);

    const visibility: PostVisibility = spec.visibility ?? 'public';

    const post: Omit<Post, 'id'> = {
      authorId,
      labId: visibility === 'members_only' ? labId : null,
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
    };

    batch.set(postRef, { ...post });
    ops++;
    await commitIfNeeded();

    const feedPayload = {
      postId,
      authorId,
      createdAt,
    };

    for (const uid of recipients) {
      const itemRef = doc(db, 'feed', uid, 'items', postId);
      batch.set(itemRef, feedPayload);
      ops++;
      await commitIfNeeded();
    }

    createdIds.push(postId);
  }

  if (ops > 0) {
    await batch.commit();
  }

  return createdIds;
}

export const DUMMY_POST_COUNT = DUMMY_POSTS.length;
