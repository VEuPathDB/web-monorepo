import React from 'react';
import { useWdkStudyRecords } from '../core/hooks/study';
import { useConfiguredSubsettingClient } from '../core/hooks/client';
import { Link, useRouteMatch } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface Props {
  edaServiceUrl: string;
}

export function EdaNotebookLandingPage(props: Props) {
  const subsettingClient = useConfiguredSubsettingClient(props.edaServiceUrl);
  const datasets = useWdkStudyRecords(subsettingClient);
  const { url } = useRouteMatch();
  return (
    <div>
      <h1>EDA Notebooks</h1>
      <div>
        <h2>Start a new notebook</h2>
        <ul>
          {datasets?.map((dataset) => (
            <li>
              {safeHtml(
                dataset.displayName,
                { to: `${url}/${dataset.attributes.dataset_id as string}/new` },
                Link
              )}
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div>MY NOTEBOOKS</div>
      <div>SHARED NOTEBOOKS</div>
    </div>
  );
}
