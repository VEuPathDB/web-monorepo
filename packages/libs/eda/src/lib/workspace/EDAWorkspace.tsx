import { useMemo } from 'react';

import { noop } from 'lodash';

import { makeNewAnalysis, useAnalysis } from '../core';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisPanel } from './AnalysisPanel';
import { NewAnalysisPage } from './NewAnalysis';

interface EDAWorkSpaceSavedAnalysisProps {
  analysisId: string;
  studyId: string;
}

export const EDAWorkspaceNewAnalysis = () => (
  <>
    <EDAWorkspaceHeading />
    <NewAnalysisPage />
  </>
);

/** A wrapper purely to inject analysisState using `useAnalysis` in accordance
 * with the rules of hooks */
export const EDAWorkspaceSavedAnalysis = ({
  analysisId,
  studyId,
}: EDAWorkSpaceSavedAnalysisProps) => {
  const defaultAnalysis = useMemo(() => makeNewAnalysis(studyId), [studyId]);

  const analysisState = useAnalysis(defaultAnalysis, noop, analysisId);

  return (
    <>
      <EDAWorkspaceHeading analysisState={analysisState} />
      <AnalysisPanel analysisState={analysisState} />
    </>
  );
};
