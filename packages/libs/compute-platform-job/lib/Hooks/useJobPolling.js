var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { useEffect, useRef, useState } from 'react';
import {
  getPollingDisposition,
  getPollingIntervalMs,
} from '../Utils/polling-schedule';
/**
 * Polls a job's status until it reaches a terminal state.
 *
 * Uses a recursive setTimeout rather than setInterval: the next tick is only
 * scheduled once the current request settles, so requests can never overlap
 * and a slow response cannot stack up a queue of pending polls.
 */
export function useJobPolling({ status, onPoll }) {
  const [isChecking, setIsChecking] = useState(false);
  const disposition = getPollingDisposition(status);
  const isPolling = disposition !== 'stop';
  // Held in a ref so that changing the callback identity between renders does
  // not tear down and restart the loop.
  const onPollRef = useRef(onPoll);
  onPollRef.current = onPoll;
  useEffect(() => {
    if (!isPolling) return;
    let cancelled = false;
    let timeoutId;
    let pollCount = 0;
    // Guards against onVisibilityChange starting a second concurrent poll
    // while a tick's request is still in flight.
    let inFlight = false;
    const schedule = () => {
      timeoutId = setTimeout(tick, getPollingIntervalMs(pollCount));
    };
    const tick = () =>
      __awaiter(this, void 0, void 0, function* () {
        if (cancelled) return;
        if (document.hidden) {
          schedule();
          return;
        }
        setIsChecking(true);
        inFlight = true;
        try {
          yield onPollRef.current();
        } catch (_a) {
          // Transient failure: keep the loop alive and try again next tick.
        } finally {
          inFlight = false;
        }
        if (cancelled) return;
        setIsChecking(false);
        pollCount += 1;
        schedule();
      });
    const onVisibilityChange = () => {
      if (document.hidden || cancelled || inFlight) return;
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
//# sourceMappingURL=useJobPolling.js.map
