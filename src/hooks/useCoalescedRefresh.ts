import { useCallback, useEffect, useRef } from 'react';

/**
 * Serializes full-data refreshes. Event bursts result in at most one follow-up
 * refresh after the active request, and all pending work is discarded on unmount.
 */
export function useCoalescedRefresh(refresh: () => Promise<void>) {
  const refreshRef = useRef(refresh);
  const activeRef = useRef<Promise<void> | null>(null);
  const queuedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => () => {
    mountedRef.current = false;
    queuedRef.current = false;
  }, []);

  return useCallback((): Promise<void> => {
    if (activeRef.current) {
      queuedRef.current = true;
      return activeRef.current;
    }

    const run = async (): Promise<void> => {
      do {
        queuedRef.current = false;
        await refreshRef.current();
      } while (mountedRef.current && queuedRef.current);
    };

    const active = run();
    activeRef.current = active;
    void active.finally(() => {
      if (activeRef.current === active) activeRef.current = null;
    });
    return active;
  }, []);
}
