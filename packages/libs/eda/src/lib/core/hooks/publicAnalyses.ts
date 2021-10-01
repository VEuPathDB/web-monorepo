import { useCallback } from 'react';

import { PromiseHookState, usePromise } from './promise';

import { AnalysisClient } from '../api/analysis-api';
import { PublicAnalysisSummary } from '../types/analysis';

export function usePublicAnalysisList(
  analysisClient: AnalysisClient
): PromiseHookState<PublicAnalysisSummary[]> {
  return usePromise(
    useCallback(() => analysisClient.getPublicAnalyses(), [analysisClient])
  );
}
