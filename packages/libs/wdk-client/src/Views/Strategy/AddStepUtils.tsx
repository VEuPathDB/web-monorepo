import React from 'react';

import { RecordClass } from '../../Utils/WdkModel';

type Props = {
  containerClassName?: string;
  children: React.ReactNode;
};

export const MenuChoicesContainer = ({
  containerClassName,
  children,
}: Props) => (
  <div className={`${containerClassName || ''} MenuChoicesContainer`}>
    {children}
  </div>
);

export const MenuChoice = ({ containerClassName, children }: Props) => (
  <div className={`${containerClassName || ''} MenuChoice`}>{children}</div>
);

export const inputResultSetDescription = (
  resultSetSize: number | undefined,
  inputRecordClass: RecordClass
) =>
  `${resultSetSize != null ? resultSetSize.toLocaleString() : '?'} ${
    resultSetSize === 1
      ? inputRecordClass.displayName
      : inputRecordClass.displayNamePlural
  }`;
