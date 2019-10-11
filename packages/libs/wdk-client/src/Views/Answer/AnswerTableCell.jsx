import React from 'react';
import PropTypes from 'prop-types';
import RecordLink from 'wdk-client/Views/Records/RecordLink';
import { renderAttributeValue, wrappable } from 'wdk-client/Utils/ComponentUtils';

let primaryKeyName = 'primary_key';

function AnswerTableCell(props) {
  if (props.value == null) {
    return null;
  }

  let { value, descriptor, record, recordClass } = props;

  if (descriptor.name === primaryKeyName) {
    return (
      <RecordLink
        recordId={record.id}
        recordClass={recordClass}
        className="wdk-AnswerTable-recordLink"
      >
        {renderAttributeValue(value, props)}
      </RecordLink>
    );
  }
  else {
    return renderAttributeValue(value, props);
  }
}

AnswerTableCell.propTypes = {
  // TODO Put reusable propTypes in a module
  value: PropTypes.string,
  descriptor: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(AnswerTableCell);
