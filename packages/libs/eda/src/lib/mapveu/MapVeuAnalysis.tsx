import { useMemo } from 'react';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import {
  makeNewAnalysis,
  useAnalysis,
  useStudyMetadata,
  useStudyRecord,
} from '../core';

interface Props {
  analysisId: string;
  studyId: string;
}
export function MapVeuAnalysis(props: Props) {
  const { analysisId } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const { analysis } = useAnalysis(analysisId);
  if (analysis == null) return <div>No analysis found</div>;
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children ?? [])
  );
  return (
    <>
      <h2>Study: {studyRecord.displayName}</h2>
      <h3>Study details</h3>
      <dl>
        <dt>Entities</dt>
        <dd>
          <ul>
            {entities.map((e) => (
              <li>{safeHtml(e.displayName)}</li>
            ))}
          </ul>
        </dd>
      </dl>
      <h3>Analysis details</h3>
      <dl>
        {' '}
        <dt>Name</dt>
        <dd>{analysis?.displayName}</dd>
        {/* <dt>Created</dt>
        <dd>{analysis.created}</dd> */}
      </dl>
    </>
  );
}
