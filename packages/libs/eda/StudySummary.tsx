import React from 'react';

import { StudyRecord } from './Types';
import { cx, SUMMARY_ATTRIBUTES } from './Utils';

interface Props {
  studyRecord: StudyRecord;
}

export function StudySummary(props: Props) {
  const { studyRecord } = props;
  // TODO Add attribute name/help/description as tooltip
  return (
    <div className={cx('-Summary')}>
      {SUMMARY_ATTRIBUTES.map(name => studyRecord.attributes[name]).map(div)}
    </div>
  );
}

function div(content: string | null) {
  return content && <div>{content}</div>;
}
