import React, { ReactElement } from 'react';

import { Attribute } from './Attribute';
import { DatasetGetResponseBody } from '../../../../../Service/Model';
import { isNonEmpty } from '../../../../../Utils';
import { datasetUserFullName } from '../../../../../Utils/formatting';
import { isEmpty } from 'lodash';

export type ShareListProps = {
  readonly userIsOwner: boolean;
  readonly dataset: DatasetGetResponseBody;
};

export const ShareList = ({
  userIsOwner,
  dataset: { shares },
}: ShareListProps): ReactElement => {
  const grantedShares = userIsOwner && isNonEmpty(shares)
    ? shares.filter(it => it.status === 'grant')
    : [];

  if (isEmpty(grantedShares)) {
    return <></>;
  }

  return (
    <Attribute label="Shared with">
      <ul>
        {grantedShares.map((it, i) => (
          <li key={i}>{datasetUserFullName(it.recipient)}</li>
        ))}
      </ul>
    </Attribute>
  );
};