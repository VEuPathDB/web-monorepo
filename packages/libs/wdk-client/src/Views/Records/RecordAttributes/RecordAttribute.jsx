import React from 'react';
import PropTypes from 'prop-types';
import { renderAttributeValue, wrappable } from '../../../Utils/ComponentUtils';

/** Attribute value */
function RecordAttribute(props) {
  const { record, attribute } = props;
  const value = record.attributes[attribute.name];
  if (value == null) return <em>No data available</em>;
  return renderAttributeValue(record.attributes[attribute.name], null, 'div');
}

RecordAttribute.propTypes = {
  attribute: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(RecordAttribute);
