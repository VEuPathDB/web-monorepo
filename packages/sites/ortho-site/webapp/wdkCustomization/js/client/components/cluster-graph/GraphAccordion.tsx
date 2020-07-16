import React from 'react';

import './GraphAccordion.scss';

interface Props {
  title: React.ReactNode;
  containerClassName?: string;
}

export const GraphAccordion: React.FunctionComponent<Props> = function({
  title,
  containerClassName,
  children
}) {
  const className = containerClassName == null
    ? 'GraphAccordion'
    : `GraphAccordion ${containerClassName}`;

  return (
    <details className={className} open>
      <summary className="GraphAccordionHeader">{title}</summary>
      <div className="GraphAccordionContent">
        {children}
      </div>
    </details>
  );
};
