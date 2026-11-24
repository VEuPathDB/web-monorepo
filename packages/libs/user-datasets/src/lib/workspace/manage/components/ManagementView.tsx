import React, { JSXElementConstructor } from 'react';
import { ManagementViewHeader, ManagementViewHeaderProps } from './header/ManagementViewHeader';
import { UserDatasetFiles } from '../../../Components/UserDatasetFiles';
import { DatasetGetResponseBody } from '../../../Service/Model';

export type ManagementViewProps =
  {
    readonly dataset: DatasetGetResponseBody;
    readonly modal?: JSXElementConstructor<any>;
    readonly postfixSections?: JSXElementConstructor<any>;
  }
  & ManagementViewHeaderProps;

export const ManagementView = ({
  dataset,
  modal: Modal,
  postfixSections: Postfix,
  ...props
}: ManagementViewProps): React.ReactElement => {
  return (
    <div className="dataset-management">
      <ManagementViewHeader dataset={dataset} {...props} />
      <UserDatasetFiles datasetId={dataset.datasetId} dataset={dataset} />
      {Postfix && (<Postfix />)}
      {Modal && (<Modal />)}
    </div>
  );
};

