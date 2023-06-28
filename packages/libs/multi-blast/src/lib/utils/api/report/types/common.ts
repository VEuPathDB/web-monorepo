import { keyof, partial, string, TypeOf } from 'io-ts';

export const ioJobStatus = keyof({
  queued: null,
  'in-progress': null,
  complete: null,
  failed: null,
  expired: null,
});

export const ioReportJobUserMeta = partial({
  summary: string,
  description: string,
});

export type IOJobStatus = TypeOf<typeof ioJobStatus>;
export type IOReportJobUserMeta = TypeOf<typeof ioReportJobUserMeta>;
