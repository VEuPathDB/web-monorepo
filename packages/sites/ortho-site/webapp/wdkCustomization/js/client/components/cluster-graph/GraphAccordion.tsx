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
    <details className={className} open onClick={handleToggle}>
      <summary className="GraphAccordionHeader">{title}</summary>
      <div className="GraphAccordionContent">
        {children}
      </div>
    </details>
  );
};

// This is necessary to accommodate a well-known
// limitation of Cytoscape mouse movement handlers
// when the canvas is resized and/or moved.
// See https://stackoverflow.com/a/23484505 for a description of the issue
// and https://js.cytoscape.org/#core/viewport-manipulation/cy.resize
// for an explanation of why dispatching a 'resize' event
// resolves it.
function handleToggle() {
  window.dispatchEvent(new Event('resize'));
}
