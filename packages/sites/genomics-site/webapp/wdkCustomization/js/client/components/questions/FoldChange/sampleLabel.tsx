import React from 'react';

type Props = {
  children: React.ReactNode;
};

export const sampleLabel =
  (className: string): React.FunctionComponent<Props> =>
  ({ children }) =>
    <span className={className}>{children}</span>;
