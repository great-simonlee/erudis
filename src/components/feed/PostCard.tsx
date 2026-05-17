import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { notifyResonate } from '../../lib/notify';
import { ROUTES } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import { postTypeBadge } from '../../utils/postTypeStyle';
import { roleLabel } from '../../utils/roleLabels';
import { PostCommentThread } from './PostCommentThread';
import type { FeedRow } from '../../hooks/useFeedItems';

type PostCardProps = {
  row: FeedRow;
  viewerUid: string | undefined;
  compact?: boolean;
  onChanged?: () => void;
};

function IconLike(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function IconBubble(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
      <path fill="currentColor" d="M4 4h16v12H7l-3 3zm3 3v6h10V7z" />
    </svg>
  );
}

function IconLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M3.9 12c0-1.7 1.4-3.1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7a3.1 3.1 0 0 1-3.1-3.1m5.1 1h4a3.1 3.1 0 0 0 0-6.2h-4V7h4a5 5 0 0 1 0 10z"
      />
    </svg>
  );
}

function IconBookmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
      <path fill="currentColor" d="M6 2h12v20l-6-4-6 4zm2 2v14.5l4-2.7 4 2.7V4z" />
    </svg>
  );
}

export function PostCard({ row, viewerUid, compact, onChanged }: PostCardProps) {
  const { post, author, lab } = row;
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.resonateCount);
  const [bookmarked, setBookmarked] = useState(false);

  const badge = useMemo(() => postTypeBadge(post.type), [post.type]);

  useEffect(() => {
    setLikeCount(post.resonateCount);
  }, [post.resonateCount]);

  useEffect(() => {
    if (!firebaseReady || !db || !viewerUid) return;
    void (async () => {
      const r = await getDoc(doc(db, 'posts', post.id, 'resonates', viewerUid));
      setLiked(r.exists());
      const b = await getDoc(doc(db, 'users', viewerUid, 'bookmarks', post.id));
      setBookmarked(b.exists());
    })();
  }, [post.id, viewerUid]);

  const toggleLike = async () => {
    if (!viewerUid || !db) {
      showToast('Sign in to like posts.', 'error');
      return;
    }
    const rRef = doc(db, 'posts', post.id, 'resonates', viewerUid);
    const pRef = doc(db, 'posts', post.id);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      if (next) {
        await setDoc(rRef, { userId: viewerUid, createdAt: serverTimestamp() });
        await updateDoc(pRef, { resonateCount: increment(1) });
        if (post.authorId !== viewerUid) {
          try {
            await notifyResonate(db, {
              fromUserId: viewerUid,
              postAuthorId: post.authorId,
              postId: post.id,
              postTitle: post.title,
            });
          } catch {
            /* notification is best-effort */
          }
        }
      } else {
        await deleteDoc(rRef);
        await updateDoc(pRef, { resonateCount: increment(-1) });
      }
      onChanged?.();
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
      showToast('Could not update like.', 'error');
    }
  };

  const toggleBookmark = async () => {
    if (!viewerUid || !db) {
      showToast('Sign in to bookmark.', 'error');
      return;
    }
    const bRef = doc(db, 'users', viewerUid, 'bookmarks', post.id);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      if (next) {
        await setDoc(bRef, { postId: post.id, createdAt: serverTimestamp() });
        showToast('Saved to bookmarks.', 'success');
      } else {
        await deleteDoc(bRef);
        showToast('Removed from bookmarks.', 'info');
      }
    } catch {
      setBookmarked(!next);
      showToast('Could not update bookmark.', 'error');
    }
  };

  const sharePost = async () => {
    const url = `${window.location.origin}${ROUTES.feed}#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard.', 'success');
    } catch {
      showToast('Could not copy link.', 'error');
    }
  };

  const authorName = author?.name ?? 'Member';
  const authorUid = author?.uid ?? post.authorId;
  const avatar = author?.avatarUrl;
  const longBody = post.content.length > 280 || post.content.includes('\n\n');

  return (
    <article
      id={`post-${post.id}`}
      className={`rounded-card border border-border bg-surface-card ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex gap-3">
        <Link to={ROUTES.profile(authorUid)} className="shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-10 w-10 rounded-full border-2 border-brand object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-surface-raised text-xs font-medium text-fg-muted">
              {authorName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to={ROUTES.profile(authorUid)}
              className="truncate text-sm font-semibold text-fg hover:text-brand"
            >
              {authorName}
            </Link>
            {author?.role && (
              <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[10px] uppercase tracking-wide text-fg-subtle">
                {roleLabel(author.role)}
              </span>
            )}
            {lab && post.labId && (
              <Link
                to={ROUTES.lab(post.labId)}
                className="truncate text-xs text-brand hover:underline"
              >
                {lab.name}
              </Link>
            )}
            <span className="text-xs text-fg-subtle">
              · {formatTimeAgo(post.createdAt)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badge.className}`}
            >
              {badge.label}
            </span>
            {post.researchArea && (
              <span className="text-xs text-fg-subtle">{post.researchArea}</span>
            )}
          </div>

          <h2 className={`mt-2 font-semibold text-fg ${compact ? 'text-sm' : 'text-base'}`}>
            {post.title}
          </h2>

          <div className={`mt-2 text-sm text-fg-muted ${expanded ? '' : 'line-clamp-3'}`}>
            <Markdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              }}
            >
              {post.content}
            </Markdown>
          </div>
          {longBody ? (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 text-xs font-medium text-brand hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          ) : null}

          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-fg-subtle"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => void toggleLike()}
              aria-pressed={liked}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                liked ? 'bg-brand text-white' : 'text-fg-muted hover:bg-surface-raised'
              }`}
            >
              <IconLike /> Like <span className="tabular-nums">{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setCommentsOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-raised"
            >
              <IconBubble /> Comment{' '}
              <span className="tabular-nums">{post.commentCount}</span>
            </button>
            <button
              type="button"
              onClick={() => void sharePost()}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-raised"
            >
              <IconLink /> Share
            </button>
            <button
              type="button"
              onClick={() => void toggleBookmark()}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                bookmarked ? 'text-brand' : 'text-fg-muted hover:bg-surface-raised'
              }`}
              aria-pressed={bookmarked}
            >
              <IconBookmark /> Bookmark
            </button>
          </div>

          {commentsOpen ? (
            <PostCommentThread postId={post.id} viewerUid={viewerUid} onChanged={onChanged} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
