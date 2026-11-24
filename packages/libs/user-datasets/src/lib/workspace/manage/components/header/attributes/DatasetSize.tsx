import React from 'react';
import Lodash from 'lodash';

import { Attribute } from './Attribute';
import { DatasetGetResponseBody } from '../../../../../Service/Model';
import { formatFileSize } from '../../../../../Utils/formatting';

export type DatasetSizeProps = {
  readonly dataset: DatasetGetResponseBody;
};

export const DatasetSize = ({ dataset: { files: { upload } } } : DatasetSizeProps) => (
  <Attribute label="Dataset size">
    {formatFileSize(
      upload?.contents
        ?.map(it => it.fileSize)
        ?.reduce(Lodash.add, 0)
      ?? 0
    )}
  </Attribute>
);