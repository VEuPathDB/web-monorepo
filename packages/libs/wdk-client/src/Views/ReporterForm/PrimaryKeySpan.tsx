import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

interface PrimaryKeySpanProps {
  primaryKeyString: string;
}

const PrimaryKeySpan: React.FC<PrimaryKeySpanProps> = (props) => {
  return <span>{props.primaryKeyString}</span>;
};

export default wrappable(PrimaryKeySpan);
