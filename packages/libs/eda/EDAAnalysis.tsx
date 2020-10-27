import React from 'react';
import { cx } from './Utils';
import { AnalysisSummary } from './AnalysisSummary';
import { useAnalysis } from 'ebrc-client/modules/eda-workspace-core/hooks/useAnalysis';

export function EDAAnalysis() {
  const {
    history,
    setName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis
  } = useAnalysis();
  if (history.current == null) return null;
  return (
    <div className={cx('-Analysis')}>
      <AnalysisSummary analysis={history.current} setAnalysisName={setName} copyAnalysis={copyAnalysis} saveAnalysis={saveAnalysis} deleteAnalysis={deleteAnalysis}/>
    </div>
  )
}
