import React from 'react';

import * as Utils from '../../../../Utils';
import * as VDI from '../../../../Service/Model';

import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
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
  readonly dataset: VDI.DatasetGetResponseBody;

  readonly detailsPageTitle: string;
  readonly dataNoun: string;

  readonly includeDatasetName: boolean;
  readonly isInstalled: boolean;
  readonly userIsOwner: boolean;

  readonly questions: ReadonlyArray<Question>;
};

export const AttributeList = ({
  dataNoun,
  dataset,
  detailsPageTitle,
  includeDatasetName,
  isInstalled,
  questions,
  userIsOwner,
}: AttributeListProps): React.ReactElement => {
  const showViewLink = isInstalled
    && dataset.type.name !== 'isasimple'
    && dataset.type.name !== 'stf';

  return (
    <dl className="attribute-list">
      {includeDatasetName && (
        <DatasetName datasetName={dataset.name} attributeLabel={detailsPageTitle} />
      )}

      <UnifiedStatus dataNoun={dataNoun} />

      {Utils.isNonEmpty(questions) && (
        <AvailableSearches dataset={dataset} questions={questions} />
      )}

      {showViewLink && (
        <ViewLink datasetId={dataset.datasetId} />
      )}

      <DatasetUploader user={dataset.owner} isOwner={userIsOwner} />
      <Visibility visibility={dataset.visibility} />
      <SiteSearchStatus visibility={dataset.visibility} />

      {userIsOwner && Utils.isNonEmpty(dataset.shares) && (
        <ShareList shares={dataset.shares} />
      )}

      <DatasetSummary summary={dataset.summary} />
      <DatasetDescription description={dataset.description} />
      <CreationTimestamp created={dataset.created} />
      <DatasetSize files={dataset.files} />
      <DatasetId datasetId={dataset.datasetId} />
      <DatasetType type={dataset.type} />
    </dl>
  );
}

