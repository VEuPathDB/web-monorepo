import { JobStatus } from '../Service/ServiceTypes';

export type PollingDisposition = 'continue' | 'stop';

// Written as an explicit terminal list, not `!== 'queued' && !== 'in-progress'`,
// on purpose: if the service ever adds a status, an unrecognized value should
// keep polling (visibly wrong, easy to spot) rather than silently stop (looks
// stuck).
const TERMINAL_STATUSES: readonly JobStatus[] = [
  'complete',
  'failed',
  'expired',
];

export function getPollingDisposition(status: JobStatus): PollingDisposition {
  return TERMINAL_STATUSES.includes(status) ? 'stop' : 'continue';
}

// Three flat rates, not a smooth ramp: fast while the user is most likely
// watching, then cheap over the long tail of a multi-minute alignment.
const TIERS = [
  { throughPollCount: 5, intervalMs: 2000 },
  { throughPollCount: 11, intervalMs: 5000 },
];
const STEADY_INTERVAL_MS = 15000;

export function getPollingIntervalMs(pollCount: number): number {
  const tier = TIERS.find((t) => pollCount < t.throughPollCount);
  return tier?.intervalMs ?? STEADY_INTERVAL_MS;
}
