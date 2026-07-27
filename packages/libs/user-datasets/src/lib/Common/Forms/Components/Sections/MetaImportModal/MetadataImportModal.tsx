import React, { ReactElement } from 'react';
import { Modal } from '@veupathdb/coreui';
import { Consumer } from '../../../../../Utils';

export function MetadataImportModalController(
  props: MetadataImportModalProps,
): ReactElement {

}

export interface MetadataImportModalProps {
  readonly visible: boolean;
  readonly toggleVisibility: Consumer<boolean>;

}


export function MetadataImportModal(
  props: MetadataImportModalProps,
): ReactElement {
  return (
    <Modal
      title="Import Dataset Metadata"
      toggleVisible={props.toggleVisibility}
      visible={props.visible}
    >
      <h2>
        Select a dataset and import its metadata into the current dataset.
      </h2>

      <p>
        You will need to provide a new Dataset Name, Summary, and Data File(s)
        before the current dataset can be uploaded. These required fields can
        be completed before or after importing metadata from an existing
        dataset.
      </p>

      <p>
        Metadata can be imported from a dataset you previously uploaded or one
        that has been shared with you. All imported metadata can be reviewed
        and edited before uploading the current dataset.
      </p>

      <MetadataImportTable />
    </Modal>
  );
}