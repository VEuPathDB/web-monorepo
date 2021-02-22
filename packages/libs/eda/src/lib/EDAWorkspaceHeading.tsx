import React from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

import { cx } from './Utils';
import { StudySummary } from './StudySummary';
import {
  useStudyRecord,
  useStudyRecordClass,
} from '@veupathdb/eda-workspace-core';

export function EDAWorkspaceHeading() {
  const studyRecord = useStudyRecord();
  const studyRecordClass = useStudyRecordClass();
  return (
    <div className={cx('-Heading')}>
      <h1>Explore and Analyze</h1>
      <h2>Study: {studyRecord.displayName}</h2>
      <StudySummary
        studyRecord={studyRecord}
        studyRecordClass={studyRecordClass}
      />
      <div className={cx('-Linkouts')}>
        <Link
          target="_blank"
          to={`/record/dataset/${studyRecord.id.map((p) => p.value).join('/')}`}
        >
          Study details
        </Link>
        |
        <button type="button" className="link" onClick={() => alert('todo')}>
          Bulk download
        </button>
      </div>
    </div>
  );
}
