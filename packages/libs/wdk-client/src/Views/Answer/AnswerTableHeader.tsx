import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import { AttributeField } from '../../Utils/WdkModel';

interface AnswerTableHeaderProps {
  descriptor: AttributeField;
}

function AnswerTableHeader(props: AnswerTableHeaderProps): JSX.Element {
  let {
    descriptor: { help, displayName },
  } = props;
  return <span title={help || ''}>{displayName}</span>;
}

export default wrappable(AnswerTableHeader);
