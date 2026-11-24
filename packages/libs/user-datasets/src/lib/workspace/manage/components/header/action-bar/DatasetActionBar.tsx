import React from 'react';
import * as Utils from '../../../../../Utils';
import { GrantAccessButton, GrantAccessButtonProps } from './GrantAccessButton';
import { EditDatasetButton } from './EditDatasetButton';
import { ThemedDeleteButton } from '../../../../../Components/ThemedDeleteButton';

export type DatasetActionsProps =
  {
    readonly userIsOwner: boolean;
    readonly isEditable: boolean;
    readonly tryDeleteDataset: Utils.Runnable;
  }
  & GrantAccessButtonProps
  ;

export const DatasetActionBar = ({
  isEditable,
  userIsOwner,
  tryDeleteDataset,
  ...props
}: DatasetActionsProps) => (
  <div className="actions">
    {userIsOwner && (
      <GrantAccessButton {...props} />
    )}
    {isEditable && (
      <EditDatasetButton />
    )}
    {userIsOwner && (
      <ThemedDeleteButton buttonText="Delete" onPress={tryDeleteDataset} />
    )}
  </div>
);
