import { useEffect, useRef, useState } from 'react';

import { DatasetStatusInfo } from '../Service';
import {
  getPollingDisposition,
  getPollingIntervalMs,
} from '../Utils/polling-schedule';

interface UseDatasetPollingOptions {
  status: DatasetStatusInfo | undefined;
  projectId: string;
  /** Refreshes the dataset. Rejections are swallowed; the loop retries. */
  onPoll: () => Promise<unknown>;
}

/**
 * Polls for dataset status until it reaches a terminal state.
 *
 * Uses a recursive setTimeout rather than setInterval: the next tick is only
 * scheduled once the current request settles, so requests can never overlap
 * and a slow response cannot stack up a queue of pending polls.
 */
export function useDatasetPolling({
  status,
  projectId,
  onPoll,
}: UseDatasetPollingOptions): { isPolling: boolean; isChecking: boolean } {
  const [isChecking, setIsChecking] = useState(false);

  const disposition = getPollingDisposition(status, projectId);
  const isPolling = disposition !== 'stop';

  // Held in a ref so that changing the callback identity between renders does
  // not tear down and restart the loop.
  const onPollRef = useRef(onPoll);
  onPollRef.current = onPoll;

  useEffect(() => {
    if (!isPolling) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let pollCount = 0;

    const schedule = () => {
      timeoutId = setTimeout(
        tick,
        getPollingIntervalMs(pollCount, disposition)
      );
    };

    const tick = async () => {
      if (cancelled) return;
      if (document.hidden) {
        // Nothing to show a hidden tab. Re-check on the same cadence; the
        // visibilitychange listener below fires an immediate poll on return.
        schedule();
        return;
      }

      setIsChecking(true);
      try {
        await onPollRef.current();
      } catch {
        // Transient failure: keep the loop alive and try again next tick.
      }
      if (cancelled) return;
      setIsChecking(false);
      pollCount += 1;
      schedule();
    };

    const onVisibilityChange = () => {
      if (document.hidden || cancelled) return;
      // The user just came back — refresh now and restart the backoff, rather
      // than making them wait out a 15s interval that elapsed off-screen.
      if (timeoutId) clearTimeout(timeoutId);
      pollCount = 0;
      tick();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    schedule();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isPolling, disposition]);

  return { isPolling, isChecking: isPolling && isChecking };
}
