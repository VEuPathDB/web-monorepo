import { useCallback } from 'react';
import { useLocation } from 'react-router';

import Path from 'path';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { AnalysisClient, usePublicAnalysisList } from '../core';
import { useWdkStudyRecords } from '../core/hooks/study';

import { PublicAnalyses } from './PublicAnalyses';

export interface Props {
  analysisClient: AnalysisClient;
  exampleAnalysesAuthor?: number;
}

export function PublicAnalysesRoute({
  analysisClient,
  exampleAnalysesAuthor,
}: Props) {
  const publicAnalysisListState = usePublicAnalysisList(analysisClient);
  const studyRecords = useWdkStudyRecords();

  const location = useLocation();
  const makeAnalysisLink = useCallback(
    (studyId: string, analysisId: string, ownerUserId: number) =>
      Path.join(
        location.pathname,
        '..',
        studyId,
        analysisId,
        `import/${ownerUserId}`
      ),
    [location.pathname]
  );

  useSetDocumentTitle('Public Analyses');

  return (
    <PublicAnalyses
      analysisClient={analysisClient}
      publicAnalysisListState={publicAnalysisListState}
      studyRecords={studyRecords}
      makeAnalysisLink={makeAnalysisLink}
      exampleAnalysesAuthor={exampleAnalysesAuthor}
    />
  );
}
