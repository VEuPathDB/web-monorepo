import React from 'react';
import PropTypes from 'prop-types';
import RecordLink from 'wdk-client/Views/Records/RecordLink';
import { renderAttributeValue, wrappable } from 'wdk-client/Utils/ComponentUtils';

// FIXME Remove hardcoded name and lookup from recordClass
let primaryKeyName = 'primary_key';

function AnswerTableCell(props) {
  if (props.value == null) {
    return null;
  }

  let { value, attribute, record, recordClass } = props;

  if (attribute.name === primaryKeyName) {
    return (
      <RecordLink
        recordId={record.id}
        recordClass={recordClass}
        className="wdk-AnswerTable-recordLink"
      >
        {renderAttributeValue(value)}
      </RecordLink>
    );
  }
  else {
    return renderAttributeValue(value);
  }
}

AnswerTableCell.propTypes = {
  // TODO Put reusable propTypes in a module
  value: PropTypes.string,
  attribute: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(AnswerTableCell);
