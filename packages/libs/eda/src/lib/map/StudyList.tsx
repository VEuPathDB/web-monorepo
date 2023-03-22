import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { useWdkStudyRecords } from '../core/hooks/study';

export function StudyList() {
  const { path } = useRouteMatch();
  const studies = useWdkStudyRecords();
  if (studies == null) return <div>Loading...</div>;
  return (
    <div>
      <div>Choose a study:</div>
      <ul>
        {studies.map((r) => (
          <li>
            <Link to={`${path}/${r.id.map((p) => p.value).join('/')}`}>
              {safeHtml(r.displayName)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
