import React from 'react';

import { cx } from './Utils';
import { RecordInstance, RecordClass, AttributeField } from 'wdk-client/Utils/WdkModel';
import { renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Tooltip } from 'wdk-client/Components';

interface Props {
  studyRecord: RecordInstance;
  studyRecordClass: RecordClass;
}

export function StudySummary(props: Props) {
  const { studyRecord, studyRecordClass } = props;
  return (
    <div className={cx('-Summary')}>
      {Object.entries(studyRecord.attributes).map(([name, value]) => value != null && (
        <Tooltip content={getTooltipContent(studyRecordClass.attributesMap[name])} showEvent="focus mouseenter" hideEvent="blur mouseleave">
          {renderAttributeValue(value, { tabIndex: 0 })}
        </Tooltip>
      ))}
    </div>
  );
}

function getTooltipContent(attributeField: AttributeField): string {
  const { displayName, help } = attributeField;
  if (help == null) return displayName;
  return `${displayName}: ${help}`;
}
