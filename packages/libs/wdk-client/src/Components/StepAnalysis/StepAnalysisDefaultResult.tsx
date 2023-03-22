import React from 'react';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';

export const StepAnalysisDefaultResult: React.FunctionComponent<StepAnalysisResultPluginProps> = 
  ({ analysisResult }) => <pre>{JSON.stringify(analysisResult, undefined, 2)}</pre>;
