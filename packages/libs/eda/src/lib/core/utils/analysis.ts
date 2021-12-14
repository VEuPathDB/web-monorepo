import { Analysis, AnalysisProvenance, NewAnalysis } from '../types/analysis';
import { convertISOToDisplayFormat } from './date-conversion';

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

export function makeOnImportProvenanceString(
  importCreationTime: string,
  provenance: AnalysisProvenance
) {
  return `Imported from ${provenance.onImport.ownerName} [${
    provenance.onImport.ownerOrganization
  }] on ${convertISOToDisplayFormat(importCreationTime)}.`;
}

export function makeCurrentProvenanceString(provenance: AnalysisProvenance) {
  return provenance.current.isDeleted
    ? `(Source analysis since deleted.)`
    : `(Source analysis last modified on ${convertISOToDisplayFormat(
        provenance.current.modificationTime
      )}.)`;
}

export const ANALYSIS_NAME_MAX_LENGTH = 50;
