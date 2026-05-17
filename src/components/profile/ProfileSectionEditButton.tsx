import { Pencil } from 'lucide-react';
import { AppIcon } from '../ui/AppIcon';

type ProfileSectionEditButtonProps = {
  onEdit: () => void;
  /** Accessible label, e.g. "Edit education". */
  label: string;
};

export function ProfileSectionEditButton({ onEdit, label }: ProfileSectionEditButtonProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="absolute right-3 top-3 rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-surface-raised hover:text-brand"
      aria-label={label}
    >
      <AppIcon icon={Pencil} size={16} />
    </button>
  );
}
