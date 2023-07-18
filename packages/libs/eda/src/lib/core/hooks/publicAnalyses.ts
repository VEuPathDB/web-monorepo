import { useCallback, useMemo, useState } from 'react';

import { PromiseHookState, usePromise } from './promise';

import {
  AnalysisClient,
  SingleAnalysisPatchRequest,
} from '../api/AnalysisClient';
import { PublicAnalysisSummary } from '../types/analysis';

export function usePublicAnalysisList(
  analysisClient: AnalysisClient
): PromiseHookState<PublicAnalysisSummary[]> {
  return usePromise(
    useCallback(() => analysisClient.getPublicAnalyses(), [analysisClient])
  );
}

export function useEditablePublicAnalysisList(
  publicAnalyses: PublicAnalysisSummary[],
  analysisClient: AnalysisClient
) {
  const [publicAnalysesState, setPublicAnalysesState] =
    useState(publicAnalyses);

  const updateAnalysis = useCallback(
    async (analysisId: string, patch: SingleAnalysisPatchRequest) => {
      await analysisClient.updateAnalysis(analysisId, patch);

      setPublicAnalysesState((publicAnalyses) =>
        publicAnalyses.map((publicAnalysis) =>
          publicAnalysis.analysisId !== analysisId
            ? publicAnalysis
            : {
                ...publicAnalysis,
                ...patch,
              }
        )
      );
    },
    [analysisClient]
  );

  return useMemo(
    () => ({
      publicAnalysesState,
      updateAnalysis,
    }),
    [publicAnalysesState, updateAnalysis]
  );
}
