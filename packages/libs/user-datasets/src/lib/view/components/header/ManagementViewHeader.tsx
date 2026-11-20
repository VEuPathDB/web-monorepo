import React from 'react';

import { AllDatasetsLink, AllDatasetsLinkProps } from './AllDatasetsLink';
import { DatasetActionBar, DatasetActionsProps } from './action-bar';
import { AttributeList, AttributeListProps } from './attributes';

export type ManagementViewHeaderProps =
  {
    readonly includeAllLink: boolean;
  }
  & AllDatasetsLinkProps
  & AttributeListProps
  & DatasetActionsProps
  ;

export const ManagementViewHeader = (props: ManagementViewHeaderProps) => (
  <section id="dataset-header">
    {props.includeAllLink && (
      <AllDatasetsLink workspaceTitle={props.workspaceTitle} />
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
      />
      <DatasetActionBar
        isOwner={props.isOwner}
        isEditable={props.isEditable}
        tryDeleteDataset={props.tryDeleteDataset}
        dataNoun={props.dataNoun}
        openPromotionModal={props.openPromotionModal}
        openSharingModal={props.openSharingModal}
        promotionDisabledReason={props.promotionDisabledReason}
        enableCommunityPromotion={props.enableCommunityPromotion}
      />
    </div>
  </section>
);
