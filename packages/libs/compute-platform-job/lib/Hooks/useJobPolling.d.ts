import { JobStatus } from '../Service/ServiceTypes';
interface UseJobPollingOptions {
  status: JobStatus;
  /** Refreshes the job. Rejections are swallowed; the loop retries. */
  onPoll: () => Promise<unknown>;
}
/**
 * Polls a job's status until it reaches a terminal state.
 *
 * Uses a recursive setTimeout rather than setInterval: the next tick is only
 * scheduled once the current request settles, so requests can never overlap
 * and a slow response cannot stack up a queue of pending polls.
 */
export declare function useJobPolling({
  status,
  onPoll,
}: UseJobPollingOptions): {
  isPolling: boolean;
  isChecking: boolean;
};
export {};
//# sourceMappingURL=useJobPolling.d.ts.map
