import PropTypes from 'prop-types';
import React from 'react';
import { safeHtml, wrappable } from '../../../Utils/ComponentUtils';

function RecordTableDescription(props) {
  const { description } = props.table;
  return description ? <p>{safeHtml(description)}</p> : null;
}

RecordTableDescription.propTypes = {
  table: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(RecordTableDescription);
