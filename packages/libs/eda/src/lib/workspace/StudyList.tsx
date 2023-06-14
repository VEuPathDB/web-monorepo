import { useMemo } from 'react';

import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';

import { useWdkStudyRecords } from '../core/hooks/study';
import { getStudyAccess } from '@veupathdb/study-data-access/lib/shared/studies';
import { SubsettingClient } from '../core/api';

interface StudyListProps {
  baseUrl: string;
  subsettingClient: SubsettingClient;
}
/**
 * Displays a list of links to various available studies.
 */
export function StudyList(props: StudyListProps) {
  const { baseUrl, subsettingClient } = props;

  const studyRecordAttributes = useMemo(() => ['study_access'], []);

  const datasets = useWdkStudyRecords(subsettingClient, studyRecordAttributes);

  const permissions = usePermissions();

  useSetDocumentTitle('All studies');

  if (datasets == null || permissions.loading) return <Loading />;
  return (
    <div>
      <h1>EDA Workspace</h1>
      <h2>Choose a study</h2>
      <ul>
        {datasets.map((dataset) => {
          return (
            <li key={dataset.attributes.dataset_id as string}>
              <Link to={`${baseUrl}/${dataset.attributes.dataset_id}/new`}>
                {safeHtml(dataset.displayName)} [
                <b>{getStudyAccess(dataset)}</b>]
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
