import { ReactNode } from 'react';
import { CommonModal } from '@veupathdb/wdk-client/lib/Components';
import { MAX_JOB_SECONDS, formatDuration } from '../util/runTimeEstimate';

interface JobWarningDialogProps {
  title: string;
  onClose: () => void;
  /** When given, the dialog offers "Run anyway" and "Cancel" instead of "OK". */
  onRunAnyway?: () => void;
  children: ReactNode;
}

export function JobWarningDialog({
  title,
  onClose,
  onRunAnyway,
  children,
}: JobWarningDialogProps) {
  return (
    <CommonModal title={title} onClose={onClose}>
      <div
        style={{
          minWidth: '30em',
          maxWidth: '40em',
          padding: '1em',
          textAlign: 'center',
          fontSize: '1.3em',
        }}
      >
        {children}
        <div
          style={{
            marginTop: '1.5em',
            display: 'flex',
            justifyContent: 'center',
            gap: '1em',
          }}
        >
          {onRunAnyway && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                onClose();
                onRunAnyway();
              }}
            >
              Run anyway
            </button>
          )}
          <button type="button" className="btn" autoFocus onClick={onClose}>
            {onRunAnyway ? 'Cancel' : 'OK'}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}

/** What to tell the user about an estimate over the warning threshold. */
export function RunTimeMessage({
  estimatedSeconds,
}: {
  estimatedSeconds: number;
}) {
  return estimatedSeconds > MAX_JOB_SECONDS ? (
    <>
      Run time estimate {formatDuration(estimatedSeconds)} is &gt;{' '}
      {MAX_JOB_SECONDS / 60} minutes. Remove sequences to reduce it to &lt;={' '}
      {MAX_JOB_SECONDS / 60} min.
    </>
  ) : (
    <>
      Run time estimate {formatDuration(estimatedSeconds)}. To reduce it, remove
      sequences with the table filters. The Length filter is the most potent,
      since a few very long sequences slow the whole job.
    </>
  );
}
