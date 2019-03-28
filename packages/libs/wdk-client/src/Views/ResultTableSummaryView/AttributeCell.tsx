import React from 'react';
import { RecordInstance, AttributeField } from 'wdk-client/Utils/WdkModel';
import { renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';

interface AttributeCellProps {
  attribute: AttributeField;
  recordInstance: RecordInstance;
}

export default function AttributeCell({
  attribute,
  recordInstance
}: AttributeCellProps) {
  const style = {
    textAlign: attribute.align || 'initial',
    ...(attribute.truncateTo && {
      maxWidth: `${attribute.truncateTo / 2}ex`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    })
  } as React.CSSProperties;
  return renderAttributeValue(
    recordInstance.attributes[attribute.name],
    { style },
    'div'
  );
}
