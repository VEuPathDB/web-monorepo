import { DatasetStatusInfo } from '../Service';
import type {
  DatasetUploadStatusCode,
  DatasetImportStatus,
  DatasetInstallStatus,
} from '../Service/Model/response-decoders';

/**
 * What the poller should do next, given a dataset's current status.
 *
 * `continue-slow` is `ready-for-reinstall`: the dataset is waiting on the VDI
 * reconciler's next full run, so there is no point polling at the normal rate.
 */
export type PollingDisposition = 'continue' | 'continue-slow' | 'stop';

// Written as explicit lists rather than `!== 'running'` on purpose. These are
// decoder unions; if VDI adds a value, an unknown status should keep polling
// (visibly wrong, easy to spot) rather than silently stop (looks stuck).
const TERMINAL_UPLOAD: readonly DatasetUploadStatusCode[] = [
  'rejected',
  'failed',
];
const TERMINAL_IMPORT: readonly DatasetImportStatus[] = ['invalid', 'failed'];
const TERMINAL_INSTALL: readonly DatasetInstallStatus[] = [
  'complete',
  'failed-validation',
  'failed-installation',
  'missing-dependency',
];

export function getPollingDisposition(
  status: DatasetStatusInfo | undefined,
  projectId: string
): PollingDisposition {
  if (status == null) return 'continue';

  const upload = status.upload?.status;
  if (upload != null && TERMINAL_UPLOAD.includes(upload)) return 'stop';
  if (upload !== 'success') return 'continue';

  const importStatus = status.import?.status;
  if (importStatus != null && TERMINAL_IMPORT.includes(importStatus))
    return 'stop';
  if (importStatus !== 'complete') return 'continue';

  const entry = status.install?.find((it) => it.installTarget === projectId);
  if (entry == null) return 'continue';

  // Both sub-entries gate the outcome: a failure in either is terminal, and
  // neither being terminal means the install is still in flight.
  const subStatuses = [entry.meta?.status, entry.data?.status].filter(
    (s): s is DatasetInstallStatus => s != null
  );

  if (subStatuses.some((s) => s !== 'complete' && TERMINAL_INSTALL.includes(s)))
    return 'stop';

  if (subStatuses.some((s) => s === 'ready-for-reinstall'))
    return 'continue-slow';

  if (subStatuses.length > 0 && subStatuses.every((s) => s === 'complete'))
    return 'stop';

  return 'continue';
}
