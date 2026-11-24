import React from 'react';

import { Attribute } from './Attribute';
import { Public } from '@material-ui/icons';
import { DatasetGetResponseBody } from '../../../../../Service/Model';

export const Visibility = ({ dataset: { visibility } }: VisibilityProps) => (
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

export type VisibilityProps = {
  readonly dataset: DatasetGetResponseBody;
};
