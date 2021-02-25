import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export function StudyList() {
  const { path } = useRouteMatch();
  const studies = useWdkService(async (wdkService) => {
    return wdkService.getAnswerJson(
      {
        searchName: 'Studies',
        searchConfig: {
          parameters: {},
        },
      },
      {}
    );
  });
  if (studies == null) return <div>Loading...</div>;
  return (
    <div>
      <div>Choose a study:</div>
      <ul>
        {studies.records.map((r) => (
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
