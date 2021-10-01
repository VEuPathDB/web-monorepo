import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import React from 'react';
import { useWdkStudyRecords } from '../core/hooks/study';

interface Props {
  subsettingServiceUrl: string;
  baseUrl: string;
}
export function StudyList(props: Props) {
  const { baseUrl } = props;
  const datasets = useWdkStudyRecords();

  useSetDocumentTitle('All studies');

  if (datasets == null) return <Loading />;
  return (
    <div>
      <h1>EDA Workspace</h1>
      <h2>Choose a study</h2>
      <ul>
        {datasets
          .filter((dataset) => dataset.attributes.eda_study_id != null)
          .map((dataset) => {
            return (
              <li key={dataset.attributes.datasetId?.toString()}>
                <Link to={`${baseUrl}/${dataset.attributes.dataset_id}`}>
                  {safeHtml(dataset.displayName)}
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
