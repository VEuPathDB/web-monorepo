import { JobStatus } from '../Service/ServiceTypes';
export type PollingDisposition = 'continue' | 'stop';
export declare function getPollingDisposition(
  status: JobStatus
): PollingDisposition;
export declare function getPollingIntervalMs(pollCount: number): number;
//# sourceMappingURL=polling-schedule.d.ts.map
