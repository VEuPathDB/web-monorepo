import React from 'react';
import { renderAttributeValue, wrappable } from '../../../Utils/ComponentUtils';
import {
  RecordInstance,
  AttributeField,
  RecordClass,
} from '../../../Utils/WdkModel';

interface RecordAttributeProps {
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}

/** Attribute value */
function RecordAttribute(props: RecordAttributeProps) {
  const { record, attribute } = props;
  const value = record.attributes[attribute.name];
  if (value == null) return <em>No data available</em>;
  return renderAttributeValue(record.attributes[attribute.name], null, 'div');
}

export default wrappable(RecordAttribute);
