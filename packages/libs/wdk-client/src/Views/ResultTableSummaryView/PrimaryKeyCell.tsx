import React from 'react';
import { RecordInstance, RecordClass } from '../../Utils/WdkModel';
import { RecordLink } from '../../Components';
import { renderAttributeValue } from '../../Utils/ComponentUtils';

interface PrimaryKeyCellProps {
  recordInstance: RecordInstance;
  recordClass: RecordClass;
}

export default function PrimaryKeyCell(props: PrimaryKeyCellProps) {
  return (
    <RecordLink
      recordClass={props.recordClass}
      recordId={props.recordInstance.id}
    >
      {renderAttributeValue(
        props.recordInstance.attributes[props.recordClass.recordIdAttributeName]
      )}
    </RecordLink>
  );
}
