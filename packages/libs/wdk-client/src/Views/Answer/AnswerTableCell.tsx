import React from 'react';
import RecordLink from '../../Views/Records/RecordLink';
import { renderAttributeValue, wrappable } from '../../Utils/ComponentUtils';
import {
  AttributeValue,
  AttributeField,
  RecordInstance,
  RecordClass,
} from '../../Utils/WdkModel';

// FIXME Remove hardcoded name and lookup from recordClass
const primaryKeyName = 'primary_key';

interface AnswerTableCellProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
  className?: string;
}

function AnswerTableCell(props: AnswerTableCellProps): JSX.Element | null {
  if (props.value == null) {
    return null;
  }

  const { value, attribute, record, recordClass } = props;

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
  } else {
    return renderAttributeValue(value);
  }
}

export default wrappable(AnswerTableCell);
