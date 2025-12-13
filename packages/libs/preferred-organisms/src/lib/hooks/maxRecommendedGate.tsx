import { useState, useCallback } from 'react';
import { Dialog } from '@veupathdb/wdk-client/lib/Components';
import {
  FilledButton,
  OutlinedButton,
} from '@veupathdb/coreui/lib/components/buttons';

export function useMaxRecommendedGate(
  onChange: (newValue: string[]) => void,
  selectedValues: string[],
  maxRecommended: number | undefined,
): {
  wrappedOnChange: (newValue: string[]) => void;
  modalElement: JSX.Element | null;
} {
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<string[] | null>(null);

  const handleConfirm = useCallback(() => {
    if (pendingValues) {
      onChange(pendingValues);
      setHasAcknowledged(true);
      setShowModal(false);
      setPendingValues(null);
    }
  }, [onChange, pendingValues]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPendingValues(null);
  }, []);

  const wrappedOnChange = useCallback(
    (newValues: string[]) => {
      // Pass through if maxRecommended is undefined
      if (maxRecommended === undefined) {
        onChange(newValues);
        return;
      }

      // Pass through if not exceeding limit
      if (newValues.length <= maxRecommended) {
        onChange(newValues);
        return;
      }

      // Pass through if user has already acknowledged the warning
      if (hasAcknowledged) {
        onChange(newValues);
        return;
      }

      // Otherwise, show the modal and store pending values
      setPendingValues(newValues);
      setShowModal(true);
    },
    [onChange, maxRecommended, hasAcknowledged],
  );

  const modalElement = showModal ? (
    <Dialog
      open={showModal}
      modal={true}
      title="Recommended Limit Exceeded"
      onClose={handleCancel}
    >
      <div style={{ padding: '1em', width: 550, display: 'grid' }}>
        <p
          style={{
            fontSize: '1.2em',
            fontWeight: 500,
            marginBottom: '1em',
            justifySelf: 'center',
          }}
        >
          You are selecting more than {maxRecommended} organisms.
        </p>
        <p
          style={{
            fontSize: '1.2em',
            justifySelf: 'center',
            textAlign: 'center',
            width: 400,
          }}
        >
          Selecting a large number of organisms may impact performance and make
          results harder to interpret.
        </p>
        <p
          style={{
            fontSize: '1.2em',
            justifySelf: 'center',
            textAlign: 'center',
            width: 400,
            marginTop: '1em',
          }}
        >
          You can continue if needed, but we recommend staying within the
          recommended limit for best results. This warning will only appear
          once.
        </p>
        <div
          style={{
            marginTop: '3em',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <FilledButton
            text="Continue with Selection"
            onPress={handleConfirm}
            themeRole="primary"
          />
          <OutlinedButton
            text="Cancel"
            onPress={handleCancel}
            themeRole="primary"
          />
        </div>
      </div>
    </Dialog>
  ) : null;

  return {
    wrappedOnChange,
    modalElement,
  };
}
