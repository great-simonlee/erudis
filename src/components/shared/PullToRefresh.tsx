import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

type PullToRefreshProps = {
  children: ReactNode;
  onRefresh: () => void;
  isRefreshing: boolean;
  enabled?: boolean;
};

export function PullToRefresh({
  children,
  onRefresh,
  isRefreshing,
  enabled = true,
}: PullToRefreshProps) {
  const { pullDistance, progress, active, ready, isRefreshing: refreshing } = usePullToRefresh({
    onRefresh,
    isRefreshing,
    enabled,
  });

  const showIndicator = active || refreshing || pullDistance > 8;

  return (
    <div className="relative">
      <div
        className="pointer-events-none fixed left-0 right-0 z-30 flex justify-center md:hidden"
        style={{ top: '3.5rem' }}
        aria-hidden={!showIndicator}
      >
        <div
          className={`flex items-center justify-center rounded-full border border-border bg-surface-card shadow-md transition-opacity duration-150 ${
            showIndicator ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '2.25rem',
            height: '2.25rem',
            transform: `translateY(${Math.max(0, pullDistance - 28)}px) scale(${0.85 + progress * 0.15})`,
          }}
        >
          <Loader2
            className={`h-5 w-5 text-brand ${refreshing ? 'animate-spin' : ''}`}
            strokeWidth={2}
            style={{
              transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
            }}
          />
        </div>
        <span className="sr-only">
          {refreshing ? 'Refreshing feed' : ready ? 'Release to refresh' : 'Pull down to refresh'}
        </span>
      </div>

      <div
        className="will-change-transform md:!translate-y-0"
        style={{
          transform:
            pullDistance > 0 ? `translate3d(0, ${pullDistance}px, 0)` : undefined,
          transition: active ? 'none' : 'transform 0.22s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
