import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { safeGetDoc } from '../../lib/firestoreAccess';
import { togglePostLike, togglePostResonate } from '../../lib/postEngagement';
import { notifyLike, notifyResonate } from '../../lib/notify';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import { postTypeAccentBorder, postTypeBadge } from '../../utils/postTypeStyle';
import { roleLabel } from '../../utils/roleLabels';
import { PostCommentThread } from './PostCommentThread';
import type { FeedRow } from '../../hooks/useFeedItems';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';
import { Bookmark, Heart, MessageSquare, Share2, Waves } from 'lucide-react';

type PostCardProps = {
  row: FeedRow;
  viewerUid: string | undefined;
  compact?: boolean;
  onChanged?: () => void;
};

const actionIconSize = 18;

export function PostCard({ row, viewerUid, compact, onChanged }: PostCardProps) {
  const { post, author, lab } = row;
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [resonated, setResonated] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [resonateCount, setResonateCount] = useState(post.resonateCount ?? 0);
  const [bookmarked, setBookmarked] = useState(false);

  const badge = useMemo(() => postTypeBadge(post.type), [post.type]);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setResonateCount(post.resonateCount ?? 0);
  }, [post.likeCount, post.resonateCount]);

  useEffect(() => {
    if (!firebaseReady || !db || !viewerUid) return;
    let cancelled = false;
    void (async () => {
      try {
        const [likeSnap, resonateSnap, bookmarkSnap] = await Promise.all([
          safeGetDoc(doc(db, 'posts', post.id, 'likes', viewerUid)),
          safeGetDoc(doc(db, 'posts', post.id, 'resonates', viewerUid)),
          safeGetDoc(doc(db, 'users', viewerUid, 'bookmarks', post.id)),
        ]);
        if (cancelled) return;
        setLiked(likeSnap?.exists() ?? false);
        setResonated(resonateSnap?.exists() ?? false);
        setBookmarked(bookmarkSnap?.exists() ?? false);
      } catch {
        if (!cancelled) {
          setLiked(false);
          setResonated(false);
          setBookmarked(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post.id, viewerUid]);

  const viewerName = profile?.name ?? 'Someone';

  const toggleLike = async () => {
    if (!viewerUid || !db) {
      showToast('Sign in to like posts.', 'error');
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      await togglePostLike(db, {
        postId: post.id,
        postAuthorId: post.authorId,
        viewerUid,
        currentlyLiked: liked,
      });
      if (next && post.authorId !== viewerUid) {
        try {
          await notifyLike(db, {
            fromUserId: viewerUid,
            fromUserName: viewerName,
            postAuthorId: post.authorId,
            postId: post.id,
            postTitle: post.title,
          });
        } catch {
          /* best-effort */
        }
      }
      onChanged?.();
    } catch {
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      showToast('Could not update like.', 'error');
    }
  };

  const toggleResonate = async () => {
    if (!viewerUid || !db) {
      showToast('Sign in to resonate.', 'error');
      return;
    }
    const next = !resonated;
    setResonated(next);
    setResonateCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      await togglePostResonate(db, {
        postId: post.id,
        postAuthorId: post.authorId,
        viewerUid,
        currentlyResonated: resonated,
      });
      if (next && post.authorId !== viewerUid) {
        try {
          await notifyResonate(db, {
            fromUserId: viewerUid,
            fromUserName: viewerName,
            postAuthorId: post.authorId,
            postId: post.id,
            postTitle: post.title,
          });
        } catch {
          /* best-effort */
        }
      }
      if (next) {
        showToast('Resonated — shared with your followers.', 'success');
      }
      onChanged?.();
    } catch {
      setResonated(!next);
      setResonateCount((c) => Math.max(0, c + (next ? -1 : 1)));
      showToast('Could not update resonate.', 'error');
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
      className={`erudis-post-card ${postTypeAccentBorder(post.type)} ${
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

          <div className="mt-4 -mx-1 flex flex-wrap items-center gap-1 rounded-lg border border-dashed border-border/80 bg-surface-raised/40 px-2 py-2">
            <button
              type="button"
              onClick={() => void toggleLike()}
              aria-pressed={liked}
              title="Appreciate this work (author only)"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                liked
                  ? 'bg-rose-500/90 text-white'
                  : 'text-fg-muted hover:bg-surface-raised hover:text-rose-300'
              }`}
            >
              <AppIcon
                icon={Heart}
                size={actionIconSize}
                strokeWidth={ICON_STROKE}
                className={liked ? 'fill-current' : ''}
              />{' '}
              Like <span className="tabular-nums">{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => void toggleResonate()}
              aria-pressed={resonated}
              title="Amplify to your followers"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                resonated
                  ? 'bg-brand text-white'
                  : 'text-fg-muted hover:bg-surface-raised hover:text-brand'
              }`}
            >
              <AppIcon icon={Waves} size={actionIconSize} strokeWidth={ICON_STROKE} /> Resonate{' '}
              <span className="tabular-nums">{resonateCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setCommentsOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-raised"
            >
              <AppIcon icon={MessageSquare} size={actionIconSize} strokeWidth={ICON_STROKE} /> Comment{' '}
              <span className="tabular-nums">{post.commentCount}</span>
            </button>
            <button
              type="button"
              onClick={() => void sharePost()}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-raised"
            >
              <AppIcon icon={Share2} size={actionIconSize} strokeWidth={ICON_STROKE} /> Share
            </button>
            <button
              type="button"
              onClick={() => void toggleBookmark()}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                bookmarked ? 'text-brand' : 'text-fg-muted hover:bg-surface-raised'
              }`}
              aria-pressed={bookmarked}
            >
              <AppIcon
                icon={Bookmark}
                size={actionIconSize}
                strokeWidth={ICON_STROKE}
                className={bookmarked ? 'fill-current' : ''}
              />{' '}
              Bookmark
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
