import React, { useRef, useState, FormEvent } from 'react';
import { Dialog } from '@veupathdb/wdk-client/lib/Components';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

interface ClustalAlignmentFormProps {
  action: string;
  sequenceCount: number;
  children: React.ReactNode;
  sequenceType?: string;
  warnThreshold?: number | ((form: HTMLFormElement) => number);
  blockThreshold?: number | ((form: HTMLFormElement) => number);
}

const DEFAULT_WARN_THRESHOLD = 50;
const DEFAULT_BLOCK_THRESHOLD = 1000;

export default function ClustalAlignmentForm({
  action,
  sequenceCount,
  children,
  sequenceType = 'sequences',
  warnThreshold,
  blockThreshold,
}: ClustalAlignmentFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [evaluatedWarnThreshold, setEvaluatedWarnThreshold] =
    useState<number | null>(null);
  const [evaluatedBlockThreshold, setEvaluatedBlockThreshold] =
    useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Evaluate thresholds dynamically if they're functions
    const actualWarn =
      typeof warnThreshold === 'function'
        ? formRef.current
          ? warnThreshold(formRef.current)
          : DEFAULT_WARN_THRESHOLD
        : warnThreshold ?? DEFAULT_WARN_THRESHOLD;
    const actualBlock =
      typeof blockThreshold === 'function'
        ? formRef.current
          ? blockThreshold(formRef.current)
          : DEFAULT_BLOCK_THRESHOLD
        : blockThreshold ?? DEFAULT_BLOCK_THRESHOLD;

    setEvaluatedWarnThreshold(actualWarn);
    setEvaluatedBlockThreshold(actualBlock);
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const isBlocked =
    evaluatedBlockThreshold !== null && sequenceCount > evaluatedBlockThreshold;
  const showWarning =
    evaluatedWarnThreshold !== null &&
    evaluatedBlockThreshold !== null &&
    sequenceCount > evaluatedWarnThreshold &&
    sequenceCount <= evaluatedBlockThreshold;

  return (
    <>
      <form
        ref={formRef}
        action={action}
        target="_blank"
        method="post"
        onSubmit={handleSubmit}
      >
        {children}
      </form>

      <Dialog
        open={showModal}
        modal
        title="Run Clustal Omega Alignment"
        onClose={handleCancel}
      >
        <div style={{ padding: '10px', width: '500px' }}>
          {showWarning && (
            <Banner
              banner={{
                type: 'warning',
                message: (
                  <>
                    You have selected{' '}
                    <strong>
                      {sequenceCount} {sequenceType}
                    </strong>
                    . Aligning this many {sequenceType} may take several minutes
                    to complete.
                  </>
                ),
              }}
            />
          )}
          {isBlocked && (
            <Banner
              banner={{
                type: 'error',
                message: (
                  <>
                    You have selected{' '}
                    <strong>
                      {sequenceCount} {sequenceType}
                    </strong>
                    , which exceeds the maximum limit.
                    <br />
                    Please reduce your selection to fewer than{' '}
                    {evaluatedBlockThreshold} {sequenceType} to proceed.
                  </>
                ),
              }}
            />
          )}
          {!isBlocked && (
            <>
              <p style={{ marginTop: '0px' }}>
                The alignment results will open in a new browser tab.
              </p>
              <p>The tab may appear empty while the alignment is running.</p>
              <p>
                <strong>
                  Please be patient and avoid resubmitting - multiple requests
                  will not make it faster and can overload our servers.
                </strong>
              </p>
            </>
          )}
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <button type="button" className="btn" onClick={handleCancel}>
              {isBlocked ? 'OK' : 'Cancel'}
            </button>
            {!isBlocked && (
              <button
                type="button"
                className="btn"
                onClick={handleConfirm}
                style={{
                  backgroundColor: 'var(--coreui-color-primary)',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                Continue Alignment
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
