import React from 'react';
import { ManagementViewHeader, ManagementViewHeaderProps } from './header/ManagementViewHeader';
import { UserDatasetFiles } from '../../Components/UserDatasetFiles';
import { DatasetGetResponseBody } from '../../Service';

export type ManagementViewProps =
  {
    readonly dataset: DatasetGetResponseBody;
    readonly modal?: React.JSXElementConstructor<any>;
  }
  & ManagementViewHeaderProps;

export const ManagementView = ({
  dataset,
  modal: Modal,
  ...props
}: ManagementViewProps): React.ReactElement => {
  return (
    <div className="dataset-management">
      <ManagementViewHeader dataset={dataset} {...props} />
      <UserDatasetFiles datasetId={dataset.datasetId} dataset={dataset} />
      {Modal && (<Modal />)}
    </div>
  );
};

