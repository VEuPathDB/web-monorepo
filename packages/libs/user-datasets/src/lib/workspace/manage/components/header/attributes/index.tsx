import React, { ReactElement } from 'react';

import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { VdiMetadata } from '../../../../../Service/utils/use-vdi';
import { Possible } from '../../../../../Utils';
import { DatasetGetResponseBody } from '../../../../../Service/Model';

import { AvailableSearches } from './AvailableSearches';
import { CreationTimestamp } from './CreationTimestamp';
import { DatasetDescription } from './DatasetDescription';
import { DatasetId } from './DatasetId';
import { DatasetName } from './DatasetName';
import { DatasetSize } from './DatasetSize';
import { DatasetSummary } from './DatasetSummary';
import { DatasetType } from './DatasetType';
import { DatasetUploader } from './DatasetUploader';
import { EdaLinkout } from './EdaLinkout';
import { ShareList } from './ShareList';
import { SiteSearchStatus } from './SiteSearchStatus';
import { UnifiedStatus } from './MergedStatus';
import { ViewLink } from './ViewLink';
import { Visibility } from './Visibility';


export type AttributeListProps = {
  readonly dataset: DatasetGetResponseBody;

  readonly detailsPageTitle: string;
  readonly dataNoun: string;

  readonly includeDatasetName: boolean;
  readonly isInstalled: boolean;
  readonly userIsOwner: boolean;

  readonly questions: Possible<ReadonlyArray<Question>>;

  readonly vdiMetadata: VdiMetadata;
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
      <EdaLinkout dataset={dataset} />
      <AvailableSearches dataset={dataset} questions={questions} />
      <ViewLink dataset={dataset} isInstalled={isInstalled} />
      <DatasetUploader user={dataset.owner} isOwner={userIsOwner} />
      <Visibility dataset={dataset} />
      <SiteSearchStatus visibility={dataset.visibility} />
      <ShareList dataset={dataset} userIsOwner={userIsOwner} />
      <DatasetSummary dataset={dataset} />
      <DatasetDescription description={dataset.description} />
      <CreationTimestamp created={dataset.created} />
      <DatasetSize dataset={dataset} />
      <DatasetId datasetId={dataset.datasetId} />
      <DatasetType dataset={dataset} />
    </dl>
  );
}

