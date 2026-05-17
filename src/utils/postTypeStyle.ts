import type { PostType } from '../types';

export type PostTypeBadgeStyle = {
  label: string;
  className: string;
};

/** Left border accent for post cards in the feed. */
export function postTypeAccentBorder(type: PostType): string {
  switch (type) {
    case 'result':
      return 'border-l-[#8b7cf8]';
    case 'paper_review':
      return 'border-l-brand';
    case 'idea':
      return 'border-l-amber-500';
    case 'milestone':
      return 'border-l-yellow-500';
    case 'paper':
      return 'border-l-sky-500';
    case 'question':
      return 'border-l-teal-500';
    default:
      return 'border-l-zinc-500';
  }
}

export function postTypeBadge(type: PostType): PostTypeBadgeStyle {
  switch (type) {
    case 'update':
      return { label: 'Update', className: 'bg-zinc-600/25 text-zinc-200 border-zinc-500/40' };
    case 'result':
      return {
        label: 'Result',
        className: 'border-[#3C3489]/50 bg-[#EEEDFE]/15 text-[#c4bef5]',
      };
    case 'paper_review':
      return { label: 'Paper review', className: 'bg-brand/20 text-brand border-brand/40' };
    case 'idea':
      return { label: 'Idea', className: 'bg-amber-500/15 text-amber-200 border-amber-500/35' };
    case 'milestone':
      return { label: 'Milestone', className: 'bg-yellow-500/15 text-yellow-100 border-yellow-500/35' };
    case 'paper':
      return { label: 'Paper', className: 'bg-sky-600/20 text-sky-100 border-sky-500/40' };
    case 'question':
      return { label: 'Question', className: 'bg-teal-600/20 text-teal-100 border-teal-500/40' };
    default:
      return { label: String(type), className: 'bg-zinc-600/25 text-zinc-200' };
  }
}
