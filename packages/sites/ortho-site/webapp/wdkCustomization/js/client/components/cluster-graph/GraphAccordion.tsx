import React from 'react';

import './GraphAccordion.scss';

interface Props {
  title: React.ReactNode;
}

export const GraphAccordion: React.FunctionComponent<Props> = function({ title, children }) {
  return (
    <details className="GraphAccordion" open>
      <summary className="GraphAccordionHeader">{title}</summary>
      <div className="GraphAccordionContent">
        {children}
      </div>
    </details>
  );
}
