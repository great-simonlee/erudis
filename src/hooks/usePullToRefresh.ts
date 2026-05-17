import { useCallback, useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 72;
const MAX_PULL = 112;
const MOBILE_MQ = '(max-width: 767px)';

type UsePullToRefreshOptions = {
  onRefresh: () => void;
  isRefreshing: boolean;
  enabled?: boolean;
};

function scrollTop(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function usePullToRefresh({
  onRefresh,
  isRefreshing,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [active, setActive] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullRef = useRef(0);
  const triggeredRef = useRef(false);

  pullRef.current = pullDistance;

  const resetPull = useCallback(() => {
    pullingRef.current = false;
    triggeredRef.current = false;
    setPullDistance(0);
  }, []);

  useEffect(() => {
    if (!isRefreshing && triggeredRef.current) {
      const t = window.setTimeout(resetPull, 180);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isRefreshing, resetPull]);

  useEffect(() => {
    if (!enabled) return undefined;

    const mq = window.matchMedia(MOBILE_MQ);
    const attach = () => {
      if (!mq.matches) {
        resetPull();
        return undefined;
      }

      const onTouchStart = (e: TouchEvent) => {
        if (isRefreshing || scrollTop() > 6) return;
        startYRef.current = e.touches[0]?.clientY ?? 0;
        pullingRef.current = true;
        setActive(true);
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!pullingRef.current || isRefreshing) return;
        const y = e.touches[0]?.clientY ?? 0;
        const delta = y - startYRef.current;

        if (delta <= 0) {
          setPullDistance(0);
          return;
        }

        if (scrollTop() > 6) {
          resetPull();
          return;
        }

        e.preventDefault();
        const next = Math.min(delta * 0.45, MAX_PULL);
        pullRef.current = next;
        setPullDistance(next);
      };

      const onTouchEnd = () => {
        if (!pullingRef.current) return;
        pullingRef.current = false;
        setActive(false);

        if (pullRef.current >= PULL_THRESHOLD && !isRefreshing) {
          triggeredRef.current = true;
          setPullDistance(PULL_THRESHOLD);
          onRefresh();
        } else if (!isRefreshing) {
          resetPull();
        }
      };

      const onTouchCancel = () => {
        if (!isRefreshing) resetPull();
        pullingRef.current = false;
        setActive(false);
      };

      document.addEventListener('touchstart', onTouchStart, { passive: true });
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
      document.addEventListener('touchcancel', onTouchCancel);

      return () => {
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('touchcancel', onTouchCancel);
      };
    };

    let cleanup = attach();
    const onMq = () => {
      cleanup?.();
      cleanup = attach();
    };
    mq.addEventListener('change', onMq);

    return () => {
      cleanup?.();
      mq.removeEventListener('change', onMq);
    };
  }, [enabled, isRefreshing, onRefresh, resetPull]);

  useEffect(() => {
    if (!enabled) return undefined;
    const mq = window.matchMedia(MOBILE_MQ);
    if (!mq.matches) return undefined;

    const prev = document.documentElement.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = 'contain';
    return () => {
      document.documentElement.style.overscrollBehaviorY = prev;
    };
  }, [enabled]);

  const indicatorPull = isRefreshing ? PULL_THRESHOLD : pullDistance;
  const progress = Math.min(indicatorPull / PULL_THRESHOLD, 1);

  return {
    pullDistance: indicatorPull,
    progress,
    active: active || isRefreshing,
    ready: progress >= 1,
    isRefreshing,
  };
}
