import React, { ReactElement } from 'react';

import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { Possible } from '../../../../Utils';
import { DatasetGetResponseBody, VdiServiceMetadata } from '../../../../Service';

import { AvailableSearches } from './AvailableSearches';
import { ViewLink } from './ViewLink';
import { Visibility } from './Visibility';
import { SiteSearchStatus } from './SiteSearchStatus';
import { ShareList } from './ShareList';
import { DatasetSummary } from './DatasetSummary';
import { DatasetDescription } from './DatasetDescription';
import { CreationTimestamp } from './CreationTimestamp';
import { DatasetSize } from './DatasetSize';
import { DatasetId } from './DatasetId';
import { DatasetType } from './DatasetType';
import { DatasetUploader } from './DatasetUploader';
import { DatasetName } from './DatasetName';
import { UnifiedStatus } from './MergedStatus';


export type AttributeListProps = {
  readonly dataset: DatasetGetResponseBody;

  readonly detailsPageTitle: string;
  readonly dataNoun: string;

  readonly includeDatasetName: boolean;
  readonly isInstalled: boolean;
  readonly userIsOwner: boolean;

  readonly questions: Possible<ReadonlyArray<Question>>;

  readonly vdiMetadata: VdiServiceMetadata;
};


export const AttributeList = ({
  dataNoun,
  dataset,
  detailsPageTitle,
  includeDatasetName,
  isInstalled,
  questions,
  userIsOwner,
  vdiMetadata,
}: AttributeListProps): ReactElement => {
  return (
    <dl className="attribute-list">
      {includeDatasetName && (
        <DatasetName datasetName={dataset.name} attributeLabel={detailsPageTitle} />
      )}

      <UnifiedStatus dataset={dataset} dataNoun={dataNoun} vdiMetadata={vdiMetadata} />
      <AvailableSearches dataset={dataset} questions={questions} />
      <ViewLink dataset={dataset} isInstalled={isInstalled} />
      <DatasetUploader user={dataset.owner} isOwner={userIsOwner} />
      <Visibility visibility={dataset.visibility} />
      <SiteSearchStatus visibility={dataset.visibility} />
      <ShareList dataset={dataset} userIsOwner={userIsOwner} />
      <DatasetSummary dataset={dataset} />
      <DatasetDescription description={dataset.description} />
      <CreationTimestamp created={dataset.created} />
      <DatasetSize files={dataset.files} />
      <DatasetId datasetId={dataset.datasetId} />
      <DatasetType type={dataset.type} />
    </dl>
  );
}

