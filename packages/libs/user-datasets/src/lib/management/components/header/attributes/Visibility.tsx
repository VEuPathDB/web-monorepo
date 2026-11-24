import React from 'react';

import * as VDI from '../../../../Service/Model';
import { Attribute } from './Attribute';
import { Public } from '@material-ui/icons';

export type VisibilityProps = {
  readonly visibility: VDI.DatasetVisibility;
};

export const Visibility = ({ visibility }: VisibilityProps) => (
  <Attribute label="Visibility">
    {
      visibility === 'public'
        ? (
          <>
            <Public className="community-visible"/>{' '}
            Public - accessible to the public for use and download.
          </>
        )
        : (
          <>
            Private - only visible to the owner and other users it has been
            shared it with.
          </>
        )
    }
  </Attribute>
);