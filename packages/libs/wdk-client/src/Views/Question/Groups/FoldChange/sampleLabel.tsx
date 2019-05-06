import React from 'react';

export const sampleLabel = (className: string): React.FunctionComponent => ({ children }) => <span className={className}>{children}</span>;
