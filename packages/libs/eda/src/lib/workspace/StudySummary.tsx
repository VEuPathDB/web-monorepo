import { WDKClientTooltip } from '@veupathdb/wdk-client/lib/Components';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AttributeField } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import React from 'react';
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
            <WDKClientTooltip
              key={name}
              content={getTooltipContent(studyRecordClass.attributesMap[name])}
            >
              {renderAttributeValue(value, { tabIndex: 0 })}
            </WDKClientTooltip>
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
