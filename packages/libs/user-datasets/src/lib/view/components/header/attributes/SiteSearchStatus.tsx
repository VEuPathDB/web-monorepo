import React from 'react';

import * as VDI from '../../../../Service/Model';

import { Attribute } from './Attribute';

export type SiteSearchStatusProps = {
  readonly visibility: VDI.DatasetVisibility;
};

export const SiteSearchStatus = ({ visibility }: SiteSearchStatusProps) => (
  <Attribute label="Site search status">
    {
      visibility === 'public'
        ? 'Enabled for public datasets'
        : 'Disabled for private datasets'
    }
  </Attribute>
);