import { CSSProperties, ReactElement } from 'react';
import { Modal } from '@veupathdb/coreui';
import { Consumer, Runnable } from '../../../Utils';
import { CommunityAccess } from '../../Misc/CommunityAccess';

export interface UploadWarningModalProps {
  readonly visible: boolean;
  readonly setVisible: Consumer<boolean>;
  readonly runUpload: Runnable;
}

/**
 * Temporary upload warning modal for the initial release of the dataExplorer
 * dataset upload form, warning the user that metadata updates are not yet
 * implemented, and that publishing a dataset requires the form be completed on
 * initial upload.
 */
export function UploadWarningModal(
  props: UploadWarningModalProps
): ReactElement {
  const onClose = () => props.setVisible(false);

  const buttonStyle: CSSProperties = {
    marginTop: '2em',
    border: 'none',
    borderRadius: '8px',
    padding: '0.9em 1.4em',
    fontWeight: 'bold',
    fontSize: '1.2em',
    width: '182px',
  };

  return (
    <Modal
      title="Please Review Before Uploading"
      themeRole="primary"
      includeCloseButton={true}
      toggleVisible={onClose}
      visible={props.visible}
      styleOverrides={{
        size: { width: '768px' },
      }}
      titleSize="medium"
    >
      <div style={{ margin: '1.5em' }}>
        <p>
          Editing{' '}
          <strong>
            <em>My Datasets</em>
          </strong>{' '}
          after upload is planned for a future release.
        </p>
        <p>
          If you intend to make this dataset available through{' '}
          <CommunityAccess />, please ensure that all required{' '}
          <strong>
            <em>Core Dataset Information</em>
          </strong>{' '}
          and any required supporting files (such as a{' '}
          <strong>
            <em>Variable Annotations</em>
          </strong>{' '}
          file) are included before uploading.
        </p>
        <p>
          If this information is not provided, the dataset will only be
          available for private use, including personal exploration and sharing
          with selected collaborators.
        </p>
      </div>
      <div
        style={{
          margin: '1.5em',
          display: 'grid',
          justifyContent: 'space-between',
          gridTemplateColumns: 'auto auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            ...buttonStyle,
            backgroundColor: 'var(--coreui-gray-300)',
          }}
        >
          Go back
        </button>
        <button
          type="button"
          onClick={props.runUpload}
          style={{
            ...buttonStyle,
            backgroundColor: 'var(--coreui-mutedCyan-600)',
            color: 'white',
          }}
        >
          Upload Now
        </button>
      </div>
    </Modal>
  );
}
