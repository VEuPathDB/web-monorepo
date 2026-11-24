import React from 'react';
import Lodash from 'lodash';

import * as VDI from '../../../../Service/Model'
import * as Utils from '../../../../Utils'

import Attribute from './Attribute';

export type DatasetSizeProps = {
  readonly files: VDI.DatasetFileListing;
};

export const DatasetSize = ({ files: { upload } }: DatasetSizeProps) => (
  <Attribute label="Dataset size">
    {Utils.formatFileSize(
      upload?.contents
        ?.map(it => it.fileSize)
        ?.reduce(Lodash.add, 0)
      ?? 0
    )}
  </Attribute>
);