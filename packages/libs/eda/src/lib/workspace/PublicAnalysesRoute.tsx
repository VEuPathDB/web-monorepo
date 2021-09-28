import { useCallback } from 'react';
import { useLocation } from 'react-router';

import Path from 'path';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { AnalysisClient, usePublicAnalysisList } from '../core';

import { PublicAnalyses } from './PublicAnalyses';

export interface Props {
  analysisClient: AnalysisClient;
}

export function PublicAnalysesRoute({ analysisClient }: Props) {
  const publicAnalysisListState = usePublicAnalysisList(analysisClient);

  const location = useLocation();
  const makeStudyLink = useCallback(
    (studyId: string) => Path.join(location.pathname, '..', studyId, '~latest'),
    [location.pathname]
  );
  const makeAnalysisLink = useCallback(
    (studyId: string, analysisId: string) =>
      Path.join(location.pathname, '..', studyId, analysisId, 'import'),
    [location.pathname]
  );

  useSetDocumentTitle('Public Analyses');

  return (
    <PublicAnalyses
      state={publicAnalysisListState}
      makeStudyLink={makeStudyLink}
      makeAnalysisLink={makeAnalysisLink}
    />
  );
}
