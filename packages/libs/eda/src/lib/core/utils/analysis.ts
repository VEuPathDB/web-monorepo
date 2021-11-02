import { Analysis, NewAnalysis } from '../types/analysis';

export function isNewAnalysis(
  analysis?: NewAnalysis | Analysis
): analysis is NewAnalysis {
  return analysis != null && !('analysisId' in analysis);
}

export function isSavedAnalysis(
  analysis?: NewAnalysis | Analysis
): analysis is Analysis {
  return analysis != null && 'analysisId' in analysis;
}

export function getAnalysisId(analysis?: NewAnalysis | Analysis) {
  return !isSavedAnalysis(analysis) ? undefined : analysis.analysisId;
}
