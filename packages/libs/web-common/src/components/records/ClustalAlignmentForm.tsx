import React, { useRef, useState, FormEvent } from 'react';
import { Dialog } from '@veupathdb/wdk-client/lib/Components';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

interface ClustalAlignmentFormProps {
  action: string;
  sequenceCount: number;
  children: React.ReactNode;
  sequenceType?: string;
  blockThreshold?: number | ((form: HTMLFormElement) => number);
  /** If provided, called instead of submitting the form on confirm. */
  onConfirm?: () => void | Promise<void>;
}

const DEFAULT_BLOCK_THRESHOLD = 1000;

export default function ClustalAlignmentForm({
  action,
  sequenceCount,
  children,
  sequenceType = 'sequences',
  blockThreshold,
  onConfirm,
}: ClustalAlignmentFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [evaluatedBlockThreshold, setEvaluatedBlockThreshold] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submitDirectly = async () => {
    if (onConfirm) {
      try {
        await onConfirm();
      } catch {
        // No banner to show the error in once the confirm dialog is no
        // longer interposed — surface it as a modal instead, since that's
        // still the only UI this component has for reporting a failure.
        setError(
          'Something went wrong submitting your request. Please try again.'
        );
        setShowModal(true);
      }
    } else if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Evaluate thresholds dynamically if they're functions
    const actualBlock =
      typeof blockThreshold === 'function'
        ? formRef.current
          ? blockThreshold(formRef.current)
          : DEFAULT_BLOCK_THRESHOLD
        : blockThreshold ?? DEFAULT_BLOCK_THRESHOLD;

    setEvaluatedBlockThreshold(actualBlock);
    setError(null);

    // Only interpose the confirm dialog when there's actually something to
    // say (the sequence count exceeds the hard limit) — otherwise submit
    // directly, with no confirm step at all.
    if (sequenceCount > actualBlock) {
      setShowModal(true);
      return;
    }

    submitDirectly();
  };

  const handleCancel = () => {
    setShowModal(false);
    setError(null);
  };

  const isBlocked =
    evaluatedBlockThreshold !== null && sequenceCount > evaluatedBlockThreshold;

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
          {error && (
            <Banner
              banner={{
                type: 'error',
                message: error,
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
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <button type="button" className="btn" onClick={handleCancel}>
              OK
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
