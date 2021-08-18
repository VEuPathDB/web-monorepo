import React from 'react';
import { useAnalysis } from '../core';
import { AnalysisPanel } from './AnalysisPanel';

interface Props {
  analysisId: string;
}

export function SavedAnalysis(props: Props) {
  const { analysisId } = props;
  const analysisState = useAnalysis(analysisId);
  return <AnalysisPanel analysisState={analysisState} />;
}
