import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

let PrimaryKeySpan = (props) => {
  return <span>{props.primaryKeyString}</span>;
};

export default wrappable(PrimaryKeySpan);
