import { literal, partial, string, TypeOf, union } from 'io-ts';

export const ioJobStatus = union([
  literal('queued'),
  literal('in-progress'),
  literal('complete'),
  literal('failed'),
  literal('expired'),
]);

export const ioReportJobUserMeta = partial({
  summary: string,
  description: string,
});

export type IOJobStatus = TypeOf<typeof ioJobStatus>;
export type IOReportJobUserMeta = TypeOf<typeof ioReportJobUserMeta>;
