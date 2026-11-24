import React from 'react';

import { AllDatasetsLink } from './AllDatasetsLink';
import { DatasetActionBar, DatasetActionsProps } from './action-bar';
import { AttributeList, AttributeListProps } from './attributes';

export type ManagementViewHeaderProps =
  {
    readonly includeAllLink: boolean;
  }
  & AttributeListProps
  & DatasetActionsProps
  ;

export const ManagementViewHeader = (props: ManagementViewHeaderProps) => (
  <section id="dataset-header">
    {props.includeAllLink && (
      <AllDatasetsLink  />
    )}
    <div className="header">
      <AttributeList
        dataNoun={props.dataNoun}
        dataset={props.dataset}
        detailsPageTitle={props.detailsPageTitle}
        includeDatasetName={props.includeDatasetName}
        isInstalled={props.isInstalled}
        questions={props.questions}
        userIsOwner={props.userIsOwner}
        vdiMetadata={props.vdiMetadata}
      />
      <DatasetActionBar
        userIsOwner={props.userIsOwner}
        isEditable={props.isEditable}
        tryDeleteDataset={props.tryDeleteDataset}
        dataNoun={props.dataNoun}
        openPromotionModal={props.openPromotionModal}
        openSharingModal={props.openSharingModal}
        enableCommunityPromotion={props.enableCommunityPromotion}
        promotability={props.promotability}
      />
    </div>
  </section>
);
