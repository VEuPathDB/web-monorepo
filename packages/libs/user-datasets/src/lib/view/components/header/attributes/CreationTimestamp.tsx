import React from 'react';

import Attribute from './Attribute';
import { DateTime } from '../../../../Components/DateTime';

export type CreationTimestampProps = {
  readonly created: string;
};

export const CreationTimestamp = ({ created }: CreationTimestampProps) => (
  <Attribute label="Created">
    <DateTime datetime={created} />
  </Attribute>
);