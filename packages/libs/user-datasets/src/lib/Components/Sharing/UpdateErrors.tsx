import React, { ReactElement, ReactNode } from 'react';
import { CommunityAccess } from '../Misc/CommunityAccess';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { CommunityPromotionError } from './CommunityPromotionError';
import { Runnable } from '../../Utils';

interface UpdateErrorsProps {
  readonly errors: CommunityPromotionError;
  readonly targetNounLower: string;
  readonly CloseButton: () => ReactElement;
  readonly onFixErrors: Runnable;
}

export function UpdateErrors({
  errors,
  targetNounLower,
  CloseButton,
  onFixErrors,
}: UpdateErrorsProps): ReactElement {
  let content: ReactNode;

  const updateButton = errors.validationErrors
    ? (
      <button type="button" className="btn edit" onClick={onFixErrors}>
        Add missing information
      </button>
    )
    : null;

  if (errors.validationErrors) {
    content = (
      <p>
        Your dataset does not contain enough information to be discoverable
        through <CommunityAccess />.
      </p>
    );
  } else {
    content = (
      <p>
        An error occurred while sharing your {targetNounLower}. Please try
        again.
      </p>
    );
  }

  return (
    <div className="UserDataset-SharingModal-StatusView">
      <Icon fa="times-circle danger" />
      <h2>More Information Needed</h2>
      {content}
      <div>
        {updateButton}
        <CloseButton />
      </div>
    </div>
  );
}
