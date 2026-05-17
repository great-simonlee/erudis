import type { LucideIcon, LucideProps } from 'lucide-react';

/** Shared stroke weight for UI icons across the app. */
export const ICON_STROKE = 1.75;

type AppIconProps = LucideProps & {
  icon: LucideIcon;
};

export function AppIcon({
  icon: Icon,
  size = 20,
  strokeWidth = ICON_STROKE,
  className = '',
  ...rest
}: AppIconProps) {
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`.trim()}
      aria-hidden
      {...rest}
    />
  );
}
