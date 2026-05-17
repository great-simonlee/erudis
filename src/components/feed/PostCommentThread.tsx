import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import {
  MAX_COMMENT_DEPTH,
  buildCommentTree,
  canReplyToComment,
  loadPostComments,
  type CommentNode,
} from '../../lib/postComments';
import { formatTimeAgo } from '../../utils/timeAgo';
import { Button } from '../ui/Button';

type PostCommentThreadProps = {
  postId: string;
  viewerUid: string | undefined;
  onChanged?: () => void;
};

function CommentComposer({
  placeholder,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Send',
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-card border border-border bg-surface-card px-3 py-2 text-sm text-fg placeholder:text-fg-subtle"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <Button type="button" variant="outline" onClick={onSubmit}>
        {submitLabel}
      </Button>
      {onCancel ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

function CommentItem({
  node,
  depth,
  viewerUid,
  replyingToId,
  replyText,
  onReply,
  onCancelReply,
  onReplyTextChange,
  onSubmitReply,
}: {
  node: CommentNode;
  depth: number;
  viewerUid: string | undefined;
  replyingToId: string | null;
  replyText: string;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
}) {
  const isReplying = replyingToId === node.id;
  const canReply = depth < MAX_COMMENT_DEPTH - 1;

  return (
    <li className={depth > 0 ? 'mt-2' : undefined}>
      <div
        className={
          depth > 0
            ? 'ml-3 border-l-2 border-border pl-3 sm:ml-4 sm:pl-4'
            : undefined
        }
      >
        <div className="text-sm">
          <Link
            to={ROUTES.profile(node.authorId)}
            className="font-medium text-fg hover:text-brand"
          >
            {node.authorName}
          </Link>
          {node.createdAt ? (
            <span className="ml-2 text-[11px] text-fg-subtle">
              {formatTimeAgo(node.createdAt)}
            </span>
          ) : null}
          <p className="mt-0.5 whitespace-pre-wrap text-fg-muted">{node.content}</p>
        </div>
        {viewerUid && canReply ? (
          <button
            type="button"
            onClick={() => (isReplying ? onCancelReply() : onReply(node.id))}
            className="mt-1 text-xs font-medium text-brand hover:underline"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        ) : null}
        {isReplying && viewerUid ? (
          <div className="mt-2">
            <CommentComposer
              placeholder={`Reply to ${node.authorName}…`}
              value={replyText}
              onChange={onReplyTextChange}
              onSubmit={() => onSubmitReply(node.id)}
              onCancel={onCancelReply}
            />
          </div>
        ) : null}
        {node.children.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {node.children.map((child) => (
              <CommentItem
                key={child.id}
                node={child}
                depth={depth + 1}
                viewerUid={viewerUid}
                replyingToId={replyingToId}
                replyText={replyText}
                onReply={onReply}
                onCancelReply={onCancelReply}
                onReplyTextChange={onReplyTextChange}
                onSubmitReply={onSubmitReply}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export function PostCommentThread({ postId, viewerUid, onChanged }: PostCommentThreadProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Awaited<ReturnType<typeof loadPostComments>>>([]);
  const [topLevelText, setTopLevelText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const load = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      setComments(await loadPostComments(postId));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  const submit = async (text: string, parentCommentId: string | null) => {
    if (!text.trim() || !viewerUid || !db) return;
    if (parentCommentId && !canReplyToComment(comments, parentCommentId)) {
      showToast(`Replies are limited to ${MAX_COMMENT_DEPTH} levels deep.`, 'error');
      setReplyingToId(null);
      setReplyText('');
      return;
    }
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        postId,
        authorId: viewerUid,
        content: text.trim(),
        parentCommentId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });
      setTopLevelText('');
      setReplyText('');
      setReplyingToId(null);
      await load();
      onChanged?.();
      showToast(parentCommentId ? 'Reply added.' : 'Comment added.', 'success');
    } catch {
      showToast('Could not post comment.', 'error');
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface/50 p-3">
      {loading ? (
        <p className="text-xs text-fg-subtle">Loading comments…</p>
      ) : (
        <ul className="space-y-3">
          {tree.map((node) => (
            <CommentItem
              key={node.id}
              node={node}
              depth={0}
              viewerUid={viewerUid}
              replyingToId={replyingToId}
              replyText={replyText}
              onReply={(id) => {
                setReplyingToId(id);
                setReplyText('');
              }}
              onCancelReply={() => {
                setReplyingToId(null);
                setReplyText('');
              }}
              onReplyTextChange={setReplyText}
              onSubmitReply={(parentId) => void submit(replyText, parentId)}
            />
          ))}
          {tree.length === 0 && <li className="text-xs text-fg-subtle">No comments yet.</li>}
        </ul>
      )}
      {viewerUid ? (
        <div className="mt-3 border-t border-border/80 pt-3">
          <CommentComposer
            placeholder="Write a comment…"
            value={topLevelText}
            onChange={setTopLevelText}
            onSubmit={() => void submit(topLevelText, null)}
          />
        </div>
      ) : (
        <p className="mt-3 text-xs text-fg-subtle">Sign in to comment.</p>
      )}
    </div>
  );
}
