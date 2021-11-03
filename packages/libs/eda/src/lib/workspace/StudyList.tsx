import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { useWdkStudyRecords } from '../core/hooks/study';

interface StudyListProps {
  subsettingServiceUrl: string;
  baseUrl: string;
}
/**
 * Displays a list of links to various available studies.
 */
export function StudyList(props: StudyListProps) {
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
              <li key={dataset.attributes.dataset_id as string}>
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
