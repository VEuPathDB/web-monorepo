import React, { ReactElement } from 'react';
import { Modal } from '@veupathdb/coreui';
import { Runnable } from '../../../../../Utils';
import {
  DatasetSelectionTable,
  MetadataImportTableProps,
} from './DatasetSelectionTable';

import "./MetadataImportModal.scss";
import { SecondaryButton } from '../../SecondaryButton';

export interface MetadataImportModalProps extends MetadataImportTableProps {
  readonly closeAction: Runnable;
  readonly copyAction: Runnable;
}

export function DatasetSelectionModal({
  closeAction,
  copyAction,
  ...tableProps
}: MetadataImportModalProps): ReactElement {
  return (
    <Modal
      title="Copy dataset metadata from an existing dataset"
      toggleVisible={(_) => closeAction()}
      visible={true}
      closeOnEsc={true}
      includeCloseButton={true}
    >
      <div id="ud-meta-selection-modal">
        <h2>
          Select a dataset &amp; copy its metadata into the current dataset.
        </h2>

        <p>
          You can copy metadata from a dataset you previously uploaded or one
          that has been shared with you. After copying, you can review and edit
          all copied metadata.
        </p>

        <p>
          Information under &quot;Define dataset&quot; (Dataset Name, Summary,
          and Files) will not be copied or overwritten. These required fields
          are specific to the current dataset and can be completed before or
          after copying metadata.
        </p>

        <DatasetSelectionTable {...tableProps} />

        <SecondaryButton
          onClick={copyAction}
          disabled={tableProps.selection.isUndefined}
        >
          Copy from Selected Dataset
        </SecondaryButton>
      </div>
    </Modal>
  );
}
