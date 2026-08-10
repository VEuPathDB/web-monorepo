import React, { ReactElement } from 'react';
import { Modal } from '@veupathdb/coreui';
import { Runnable } from '../../../../../Utils';
import {
  MetadataImportTable,
  MetadataImportTableProps,
} from './MetadataImportTable';

import "./MetadataImportModal.scss";
import { SecondaryButton } from '../../SecondaryButton';

export interface MetadataImportModalProps {
  readonly modalProps: {
    readonly visible: boolean;
    readonly hide: Runnable;
  };

  readonly tableProps: MetadataImportTableProps;

  readonly copyAction: Runnable;
}

export function MetadataImportModal({
  modalProps: props,
  tableProps,
  copyAction,
}: MetadataImportModalProps): ReactElement {
  return (
    <Modal
      title="Import Dataset Metadata"
      toggleVisible={(_) => props.hide()}
      visible={props.visible}
      closeOnEsc={true}
      includeCloseButton={true}
    >
      <div id="ud-meta-selection-modal">
        <h2>
          Select a dataset and import its metadata into the current dataset.
        </h2>

        <p>
          You will need to provide a new Dataset Name, Summary, and Data File(s)
          before the current dataset can be uploaded. These required fields can be
          completed before or after importing metadata from an existing dataset.
        </p>

        <p>
          Metadata can be imported from a dataset you previously uploaded or one
          that has been shared with you. All imported metadata can be reviewed and
          edited before uploading the current dataset.
        </p>

        <MetadataImportTable {...tableProps} />

        <SecondaryButton
          onClick={copyAction}
          disabled={tableProps.selection === undefined}
        >
          Copy from Selected Dataset
        </SecondaryButton>
      </div>
    </Modal>
  );
}
