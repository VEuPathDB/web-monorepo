import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

let PrimaryKeySpan = props => {
  return ( <span>{props.primaryKeyString}</span> );
};

export default wrappable(PrimaryKeySpan);
