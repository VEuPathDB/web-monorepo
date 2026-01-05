import { useState, useCallback } from 'react';
import { Dialog } from '@veupathdb/wdk-client/lib/Components';
import {
  FilledButton,
  OutlinedButton,
} from '@veupathdb/coreui/lib/components/buttons';

import './maxRecommendedGate.scss';

export function useMaxRecommendedGate(
  onChange: (newValue: string[]) => void,
  maxRecommended: number | undefined,
  customMessage?: string,
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
      // Pass through if maxRecommended is not a valid positive integer
      if (
        maxRecommended === undefined ||
        !Number.isFinite(maxRecommended) ||
        maxRecommended <= 0 ||
        !Number.isInteger(maxRecommended)
      ) {
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

  const defaultMessage =
    maxRecommended !== undefined &&
    Number.isFinite(maxRecommended) &&
    maxRecommended > 0 &&
    Number.isInteger(maxRecommended) ? (
      <div>
        <p>You are selecting more than {maxRecommended} items.</p>
        <p>
          Selecting a large number of items may impact performance and make
          results harder to interpret.
        </p>
        <p>
          You can continue if needed, but we recommend staying within the
          recommended limit for best results. This warning will only appear
          once.
        </p>
      </div>
    ) : null;

  const modalElement = showModal ? (
    <Dialog
      open={showModal}
      modal={true}
      title="⚠️ Recommended Limit Exceeded"
      onClose={handleCancel}
    >
      <div className="MaxRecommendedGate">
        <div className="MaxRecommendedGate--Message">
          {customMessage ? (
            <div dangerouslySetInnerHTML={{ __html: customMessage }} />
          ) : (
            defaultMessage
          )}
        </div>
        <div className="MaxRecommendedGate--Buttons">
          <FilledButton
            text="Make another selection"
            onPress={handleCancel}
            themeRole="primary"
          />
          <OutlinedButton
            text="Ignore this warning"
            onPress={handleConfirm}
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
