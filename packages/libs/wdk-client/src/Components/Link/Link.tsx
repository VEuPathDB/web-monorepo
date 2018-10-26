import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

/** React Router Link decorator that adds className */
function Link (props: any) {
  const className = 'wdk-ReactRouterLink' + (props.className ? ' ' + props.className : '');
  return (
    <RouterLink {...props} className={className}/>
  );
};

export default wrappable(Link);
