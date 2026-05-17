import type { Post } from '../types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Trending score for Discover — resonate weighted highest (amplification). */
export function discoverTrendingScore(post: Post, nowMs = Date.now()): number {
  const createdMs = post.createdAt?.toMillis?.() ?? 0;
  if (!createdMs) return 0;
  const ageMs = nowMs - createdMs;
  if (ageMs > SEVEN_DAYS_MS) return 0;

  const hours = Math.max(ageMs / 3_600_000, 0.25);
  const raw =
    (post.resonateCount ?? 0) * 3 +
    (post.likeCount ?? 0) * 1 +
    (post.commentCount ?? 0) * 2;
  const decay = 1 / Math.pow(hours, 0.5);
  return raw * decay;
}

export function sortPostsByTrending(posts: Post[]): Post[] {
  const now = Date.now();
  return [...posts].sort(
    (a, b) => discoverTrendingScore(b, now) - discoverTrendingScore(a, now)
  );
}
