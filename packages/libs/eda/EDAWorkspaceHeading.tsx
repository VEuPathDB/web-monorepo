import React from 'react';

import { Link } from 'wdk-client/Components';

import { StudyRecord } from './Types';
import { cx } from './Utils';
import { StudySummary } from './StudySummary';

interface Props {
  studyRecord: StudyRecord;
}

export function EDAWorkspaceHeading(props: Props) {
  const { studyRecord } = props;
  return (
    <div className={cx('-Heading')}>
      <h1>Explore and Analyze</h1>
      <h2>Study: {studyRecord.displayName}</h2>
      <StudySummary studyRecord={studyRecord}/>
      <div className={cx('-Linkouts')}>
        <Link target="_blank" to={`/record/dataset/${studyRecord.id.map(p => p.value).join('/')}`}>Study details</Link>
        |
        <button type="button" className="link" onClick={() => alert('todo')}>Bulk download</button>
      </div>
    </div>
  )
}
