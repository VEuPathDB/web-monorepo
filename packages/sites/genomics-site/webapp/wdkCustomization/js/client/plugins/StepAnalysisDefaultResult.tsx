import React from 'react';
import { StepAnalysisResultPluginProps } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisResultsPane';

export const StepAnalysisDefaultResult: React.FunctionComponent<StepAnalysisResultPluginProps> = 
  ({ analysisResult }) => <pre>{JSON.stringify(analysisResult, undefined, 2)}</pre>;
