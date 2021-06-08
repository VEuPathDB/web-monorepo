import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { cx } from './Utils';
import { useStudyRecord } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export function EDAWorkspaceHeading() {
  const studyRecord = useStudyRecord();
  return (
    <div className={cx('-Heading')}>
      <h1>{safeHtml(studyRecord.displayName)}</h1>
      <div className={cx('-Linkouts')}></div>
    </div>
  );
}
