import React from 'react';
import { useAnalysis } from '../core';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisPanel } from './AnalysisPanel';
import { NewAnalysisPage } from './NewAnalysis';

interface EDAWorkSpaceSavedAnalysisProps {
  analysisId: string;
}

export const EDAWorkspaceNewAnalysis = () => (
  <>
    <EDAWorkspaceHeading />
    <NewAnalysisPage />
  </>
);

export const EDAWorkspaceSavedAnalysis = ({
  analysisId,
}: EDAWorkSpaceSavedAnalysisProps) => {
  const analysisState = useAnalysis(analysisId);

  return (
    <>
      <EDAWorkspaceHeading analysisState={analysisState} />
      <AnalysisPanel analysisState={analysisState} />;
    </>
  );
};
