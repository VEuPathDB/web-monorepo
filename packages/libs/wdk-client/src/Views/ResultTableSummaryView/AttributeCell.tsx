import React from 'react';
import { truncate } from 'lodash';
import { RecordInstance, AttributeField } from 'wdk-client/Utils/WdkModel';
import {wrappable} from 'wdk-client/Utils/ComponentUtils';

interface AttributeCellProps {
  attribute: AttributeField;
  recordInstance: RecordInstance;
}

function AttributeCell({
  attribute,
  recordInstance
}: AttributeCellProps) {
  const value = recordInstance.attributes[attribute.name];

  if (value == null) return null;

  if (typeof value === 'string') {
    const truncatedValue = truncateValue(value, attribute.truncateTo);
    return (
      <div
        title={truncatedValue !== value ? value : undefined}
        dangerouslySetInnerHTML={{
          __html: truncatedValue
        }}
      />
    );
  }

  const { url, displayText } = value;
  const display = displayText || url;
  const truncatedDisplay = truncateValue(display, attribute.truncateTo);
  return (
    <div title={truncatedDisplay !== display ? display : undefined}>
      <a
        href={url}
        dangerouslySetInnerHTML={{
          __html: truncatedDisplay
        }}
      />
    </div>
  );
}

export default wrappable(AttributeCell);

function truncateValue(value: string, length: number) {
  return length ? truncate(value, { length }) : value;
}
