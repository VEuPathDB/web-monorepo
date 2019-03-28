import React from "react";
import { RecordInstance, RecordClass } from "wdk-client/Utils/WdkModel";
import { RecordLink } from "wdk-client/Components";
import { formatAttributeValue } from "wdk-client/Utils/ComponentUtils";

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
      {formatAttributeValue(
        props.recordInstance.attributes[props.recordClass.recordIdAttributeName]
      )}
    </RecordLink>
  );
}
