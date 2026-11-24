import React from 'react';
import * as Utils from '../../../../../Utils';
import { ThemedGrantAccessButton } from '../../../../../Components/ThemedGrantAccessButton';
import { CommunityPromotability } from '../../../model';

export type GrantAccessButtonProps = {
  readonly dataNoun: string;
  readonly openPromotionModal: Utils.Runnable;
  readonly openSharingModal: Utils.Runnable;
  readonly enableCommunityPromotion: boolean;
  readonly promotability: CommunityPromotability;
};

export const GrantAccessButton = ({
  dataNoun,
  openPromotionModal,
  openSharingModal,
  enableCommunityPromotion,
  promotability,
}: GrantAccessButtonProps) => (
  <ThemedGrantAccessButton
    buttonText={`Grant Access to ${dataNoun}`}
    onPress={(grantType) => {
      switch (grantType) {
        case 'community':
          openPromotionModal();
          break;
        case 'individual':
          openSharingModal();
          break;
        default:
          // noop
          break;
      }
    }}
    disableCommunityReason={makeUnpromotableMessage(promotability)}
    communityDatasetsEnabled={enableCommunityPromotion}
  />
);

const makeUnpromotableMessage = (promotability: CommunityPromotability) => {
  switch (promotability) {
    case CommunityPromotability.CanPromote:
      return undefined;

    // allow the promote link to be enabled.  the user will be forced to add
    // the missing dataset properties file as a next step.
    case CommunityPromotability.MissingDatasetProperties:
      return undefined;

    case CommunityPromotability.NotInstalled:
      return 'Datasets that have not been installed cannot be made public.';

    default:
      return 'Dataset cannot be made public at this time due to a site error.';
  }
};
