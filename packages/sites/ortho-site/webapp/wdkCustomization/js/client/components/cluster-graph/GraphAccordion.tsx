import React from 'react';

import './GraphAccordion.scss';

interface Props {
  title: React.ReactNode;
}

export const GraphAccordion: React.FunctionComponent<Props> = function({ title, children }) {
  return (
    <details className="GraphAccordion" open>
      <summary>{title}</summary>
      {children}
    </details>
  );
}
