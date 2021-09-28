import { useCallback } from 'react';

import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { SubsettingClient } from '../core';
import { usePromise } from '../core/hooks/promise';
interface StudyListProps {
  subsettingServiceUrl: string;
  baseUrl: string;
}

/**
 * Displays a list of links to various available studies.
 */
export function StudyList({ subsettingServiceUrl, baseUrl }: StudyListProps) {
  const subsettingClient = SubsettingClient.getClient(subsettingServiceUrl);
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

  useSetDocumentTitle('All studies');

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
            <li key={study.datasetId}>
              <Link to={`${baseUrl}/${study.datasetId}`}>
                {dataset ? safeHtml(dataset.displayName) : study.id}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
