import React from 'react';
import * as VDI from '../../../../Service/Model';

import { Attribute } from './Attribute';
import { datasetUserFullName } from '../../../../Utils';

export type ShareListProps = {
  readonly shares: ReadonlyArray<VDI.DatasetShareOffer>;
};

export const ShareList = ({ shares }: ShareListProps) => (
  <Attribute label="Shared with">
    <ul>
      {shares.map((it, i) => (
        <li key={i}>{datasetUserFullName(it.recipient)}</li>
      ))}
    </ul>
  </Attribute>
);