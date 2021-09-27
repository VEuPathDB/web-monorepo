import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { AnalysisClient, usePublicAnalysisList } from '../core';

import { PublicAnalyses } from './PublicAnalyses';

export interface Props {
  analysisClient: AnalysisClient;
}

export function PublicAnalysesRoute({ analysisClient }: Props) {
  const publicAnalysisListState = usePublicAnalysisList(analysisClient);

  useSetDocumentTitle('Public Analyses');

  return <PublicAnalyses state={publicAnalysisListState} />;
}
