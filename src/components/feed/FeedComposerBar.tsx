type FeedComposerBarProps = {
  onOpenComposer: () => void;
};

export function FeedComposerBar({ onOpenComposer }: FeedComposerBarProps) {
  return (
    <button
      type="button"
      onClick={onOpenComposer}
      className="mb-6 w-full rounded-card border border-dashed border-border bg-surface-card px-4 py-3 text-left text-sm text-fg-subtle transition-colors hover:border-brand/50 hover:bg-surface-raised/60 hover:text-fg-muted"
    >
      What&apos;s on your research mind?
    </button>
  );
}
