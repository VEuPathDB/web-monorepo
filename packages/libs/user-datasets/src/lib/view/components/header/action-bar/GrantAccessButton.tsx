import * as Utils from '../../../../Utils';
import { ThemedGrantAccessButton } from '../../../../Components/ThemedGrantAccessButton';
import React from 'react';

export type GrantAccessButtonProps = {
  readonly dataNoun: string;
  readonly openPromotionModal: Utils.Runnable;
  readonly openSharingModal: Utils.Runnable;
  readonly promotionDisabledReason: Utils.Possible<string>;
  readonly enableCommunityPromotion: boolean;
};

export const GrantAccessButton = (props: GrantAccessButtonProps) => (
  <ThemedGrantAccessButton
    buttonText={`Grant Access to ${props.dataNoun}`}
    onPress={(grantType) => {
      switch (grantType) {
        case 'community':
          props.openPromotionModal();
          break;
        case 'individual':
          props.openSharingModal();
          break;
        default:
          // noop
          break;
      }
    }}
    disableCommunityReason={props.promotionDisabledReason}
    communityDatasetsEnabled={props.enableCommunityPromotion}
  />
);
