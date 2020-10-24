import React from 'react';
import { cx } from './Utils';
import { AnalysisSummary } from './AnalysisSummary';
import { Analysis } from 'ebrc-client/modules/eda-workspace-core/types/analysis';

interface Props {
  analysis: Analysis;
  setAnalysisName: (name: string) => void;
  copyAnalysis: () => void;
  saveAnalysis: () => void;
  deleteAnalysis: () => void;
}

export function EDAAnalysis(props: Props) {
  const {
    analysis,
    setAnalysisName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis
  } = props;
  return (
    <div className={cx('-Analysis')}>
      <AnalysisSummary analysis={analysis} setAnalysisName={setAnalysisName} copyAnalysis={copyAnalysis} saveAnalysis={saveAnalysis} deleteAnalysis={deleteAnalysis}/>
    </div>
  )
}