import { useEffect, useState } from 'react';

export function useFilterModalDraft<T>(applied: T) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  return {
    open,
    setOpen,
    draft,
    setDraft,
    close: () => setOpen(false),
    apply: (onApply: (next: T) => void) => {
      onApply(draft);
      setOpen(false);
    },
  };
}
