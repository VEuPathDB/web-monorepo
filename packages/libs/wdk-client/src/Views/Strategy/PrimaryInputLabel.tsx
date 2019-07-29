import React from 'react';

import { RecordClass } from 'wdk-client/Utils/WdkModel';

type Props = {
  className?: string,
  resultSetSize: number,
  recordClass: RecordClass;
};

export const PrimaryInputLabel = ({
  className,
  resultSetSize,
  recordClass
}: Props) =>
  <div className={className}>
    {resultSetSize.toLocaleString()}
    {' '}
    {resultSetSize === 1 
      ? recordClass.shortDisplayName 
      : recordClass.shortDisplayNamePlural
    }
  </div>;
