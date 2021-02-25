import React from 'react';

import { cx } from './Utils';
import { AttributeField } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/wdk-client/lib/Components';
import { StudyRecord, StudyRecordClass } from '@veupathdb/eda-workspace-core';

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
              content={getTooltipContent(studyRecordClass.attributesMap[name])}
              showEvent="focus mouseenter"
              hideEvent="blur mouseleave"
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
