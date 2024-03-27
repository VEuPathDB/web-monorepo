import React from 'react';
import { Tooltip } from '@veupathdb/coreui';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AttributeField } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { StudyRecord, StudyRecordClass } from '../core';
import { cx } from './Utils';

interface Props {
  studyRecord: StudyRecord;
  studyRecordClass: StudyRecordClass;
}

export function StudySummary(props: Props) {
  const { studyRecord, studyRecordClass } = props;
  return (
    <div className={cx('-Summary')}>
      {Object.entries(studyRecord.attributes).map(
        ([name, value]) =>
          value != null && (
            <Tooltip
              key={name}
              title={getTooltipContent(studyRecordClass.attributesMap[name])}
            >
              {renderAttributeValue(value, { tabIndex: 0 })}
            </Tooltip>
          )
      )}
    </div>
  );
}

function getTooltipContent(attributeField: AttributeField): string {
  const { displayName, help } = attributeField;
  if (help == null) return displayName;
  return `${displayName}: ${help}`;
}
