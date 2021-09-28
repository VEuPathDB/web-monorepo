import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import React, { useCallback } from 'react';
import { SubsettingClient } from '../core';
import { usePromise } from '../core/hooks/promise';
import { useWdkStudyRecords } from '../core/hooks/study';

interface Props {
  subsettingServiceUrl: string;
  baseUrl: string;
}
export function StudyList(props: Props) {
  const { baseUrl } = props;
  const subsettingClient = SubsettingClient.getClient(
    props.subsettingServiceUrl
  );
  const datasets = useWdkStudyRecords();
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
          const dataset = datasets.find(
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
