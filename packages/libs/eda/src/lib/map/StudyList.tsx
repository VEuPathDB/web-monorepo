import React from 'react';
import { Link } from 'react-router-dom';

import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { useWdkStudyRecords } from '../core/hooks/study';

export function StudyList() {
  const studies = useWdkStudyRecords();
  if (studies == null) return <div>Loading...</div>;
  return (
    <div>
      <div>Choose a study:</div>
      <ul>
        {studies.map((r) => (
          <li>
            <Link to={`${r.id.map((p) => p.value).join('/')}`}>
              {safeHtml(r.displayName)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
