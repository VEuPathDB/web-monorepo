import React, { ReactElement } from 'react';
import { DatasetSelectionModalController } from './DatasetSelectionModalController';
import { MetadataImportModalProps } from './MetadataImportModalProps';
import { Nullable, useSimpleState } from '../../../../../Utils';
import { OverwriteWarningModal } from './OverwriteWarningModal';

export function MetadataImportModalController(props: MetadataImportModalProps): Nullable<ReactElement> {
  const showedWarning = useSimpleState(false);

  if (!props.visibleState.get()) {
    return null;
  }

  return showedWarning.get()
    ? <DatasetSelectionModalController
      {...props}
      onDatasetSelect={id => {
        props.onDatasetSelect(id);
        showedWarning.set(false);
      }}
    />
    : <OverwriteWarningModal
      onAccept={() => showedWarning.set(true)}
      onReject={() => props.visibleState.set(false)}
    />;
}