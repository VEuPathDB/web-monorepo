import React, { useRef, useState, FormEvent } from 'react';
import { Dialog } from '@veupathdb/wdk-client/lib/Components';

interface ClustalAlignmentFormProps {
  action: string;
  sequenceCount: number;
  children: React.ReactNode;
  sequenceType?: string;
}

const WARN_THRESHOLD = 50;
const BLOCK_THRESHOLD = 1000;

export default function ClustalAlignmentForm({
  action,
  sequenceCount,
  children,
  sequenceType = 'sequences',
}: ClustalAlignmentFormProps) {
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  const isBlocked = sequenceCount > BLOCK_THRESHOLD;
  const showWarning =
    sequenceCount > WARN_THRESHOLD && sequenceCount <= BLOCK_THRESHOLD;

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
        <div style={{ padding: '10px', maxWidth: '600px' }}>
          <p style={{ marginTop: '0px' }}>
            The alignment results will open in a new browser tab.
          </p>
          <p>
            The tab may appear empty while the alignment is running. Please be
            patient and avoid resubmitting - multiple requests will not make it
            faster and can overload our servers.
          </p>

          {showWarning && (
            <p
              style={{
                marginTop: '20px',
                fontWeight: 'bold',
                color: '#856404',
                backgroundColor: '#fff3cd',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ffeaa7',
              }}
            >
              ⚠️ You have selected{' '}
              <strong>
                {sequenceCount} {sequenceType}
              </strong>
              . Aligning this many {sequenceType} may take several minutes to
              complete.
            </p>
          )}

          {isBlocked && (
            <p
              style={{
                marginTop: '20px',
                fontWeight: 'bold',
                color: '#721c24',
                backgroundColor: '#f8d7da',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
              }}
            >
              🛑 You have selected{' '}
              <strong>
                {sequenceCount} {sequenceType}
              </strong>
              , which exceeds the maximum limit.
              <br />
              <br />
              Please reduce your selection to fewer than {BLOCK_THRESHOLD}{' '}
              {sequenceType} to proceed.
            </p>
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
                style={{ backgroundColor: '#5a9fd4', color: 'white' }}
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
