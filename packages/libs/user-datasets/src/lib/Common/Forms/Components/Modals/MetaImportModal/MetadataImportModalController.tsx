import React, { ReactElement } from 'react';
import { DatasetSelectionModalController } from './DatasetSelectionModalController';
import { MetadataImportModalProps } from './MetadataImportModalProps';
import { Nullable } from '../../../../../Utils';
import { OverwriteWarningModal } from './OverwriteWarningModal';

export function MetadataImportModalController(props: MetadataImportModalProps): Nullable<ReactElement> {
  const [showedWarning, setShowedWarning] = React.useState<boolean>(false);

  if (!props.isVisible) {
    return null;
  }

  return showedWarning
    ? <DatasetSelectionModalController
      {...props}
      onDatasetSelect={id => {
        props.onDatasetSelect(id);
        setShowedWarning(false);
      }}
    />
    : <OverwriteWarningModal
      onAccept={() => setShowedWarning(true)}
      onReject={props.hideModal}
    />;
}