import React from 'react';
import * as Utils from '../../../../Utils';
import { GrantAccessButton, GrantAccessButtonProps } from './GrantAccessButton';
import { EditDatasetButton } from './EditDatasetButton';
import { ThemedDeleteButton } from '../../../../Components/ThemedDeleteButton';

export type DatasetActionsProps =
  {
    readonly isOwner: boolean;
    readonly isEditable: boolean;
    readonly tryDeleteDataset: Utils.Runnable;
  }
  & GrantAccessButtonProps
  ;

export const DatasetActionBar = ({
  isEditable,
  isOwner,
  tryDeleteDataset,
  ...props
}: DatasetActionsProps) => (
  <div className="actions">
    {isOwner && (
      <GrantAccessButton {...props} />
    )}
    {isEditable && (
      <EditDatasetButton />
    )}
    {isOwner && (
      <ThemedDeleteButton buttonText="Delete" onPress={tryDeleteDataset} />
    )}
  </div>
);
