import { PenLine } from 'lucide-react';
import type { PostType } from '../../types';

const PROMPT = 'Share your Intelligence, Shape the World';

type FeedComposerBarProps = {
  onOpenComposer: (initialType?: PostType) => void;
};

export function FeedComposerBar({ onOpenComposer }: FeedComposerBarProps) {
  return (
    <div className="erudis-composer-strip md:erudis-feed-stage">
      <p className="mb-4 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand md:flex">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
        Publish to your network
      </p>

      <button
        type="button"
        onClick={() => onOpenComposer()}
        className="group flex w-full items-center gap-3 rounded-full border border-border/90 bg-surface-raised/95 px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_2px_rgba(0,0,0,0.04)] transition-[transform,border-color,background-color,box-shadow] hover:border-brand/30 hover:bg-surface-card hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_12px_-6px_rgba(29,158,117,0.15)] active:scale-[0.99] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_2px_rgba(0,0,0,0.2)] md:rounded-lg md:py-3.5"
        aria-label={PROMPT}
      >
        <span className="min-w-0 flex-1 truncate whitespace-nowrap text-[15px] font-medium tracking-tight text-fg-muted md:text-sm">
          {PROMPT}
        </span>
        <PenLine
          className="h-[18px] w-[18px] shrink-0 text-brand/55 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
    </div>
  );
}
