import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import React, { useCallback } from 'react';
import { useRouteMatch } from 'react-router';
import { SubsettingClient } from '../core';
import { usePromise } from '../core/hooks/promise';

interface Props {
  subsettingServiceUrl: string;
}
export function StudyList(props: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = SubsettingClient.getClient(
    props.subsettingServiceUrl
  );
  const datasets = useWdkService(
    (wdkService) =>
      wdkService.getAnswerJson(
        {
          searchName: 'Studies',
          searchConfig: {
            parameters: {},
          },
        },
        {
          attributes: ['dataset_id'],
        }
      ),
    []
  );
  const studies = usePromise(
    useCallback(() => subsettingClient.getStudies(), [subsettingClient])
  );
  if (studies.error) return <div>{String(studies.error as any)}</div>;
  if (studies.value == null || datasets == null) return <Loading />;
  return (
    <div>
      <h1>EDA Workspace</h1>
      <h2>Choose a study</h2>
      <ul>
        {studies.value.map((study) => {
          const dataset = datasets.records.find(
            (r) => r.attributes.dataset_id === study.datasetId
          );
          return (
            <li>
              <Link to={`${url}/${study.datasetId}`}>
                {dataset ? safeHtml(dataset.displayName) : study.id}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
