// Utils

import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { defaultFormatParameterValue } from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';
import { DatasetItem } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';
import { Analysis, NewAnalysis } from '../core';
import { formatFilterDisplayValue } from '../core/utils/study-metadata';

export function parseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

/**
 * Shared step-details formatter for the `eda_analysis_spec` WDK parameter.
 * Used by both EdaNotebookParameter and EdaSubsetParameter.
 */
export function formatEdaAnalysisParameterValue(
  parameter: Parameter,
  value: string | undefined,
  datasetParamItems: Record<string, DatasetItem[]> | undefined
) {
  if (parameter.name === 'eda_analysis_spec' && value != null) {
    const obj = parseJson(value);
    if (NewAnalysis.is(obj) || Analysis.is(obj)) {
      if (obj.descriptor.subset.descriptor.length === 0) {
        return (
          <div>
            <em>No filters applied.</em>
          </div>
        );
      }
      return (
        <div style={{ whiteSpace: 'pre-line' }}>
          {obj.descriptor.subset.descriptor.map((filter, index) => (
            <div key={index}>
              {filter.variableId}: {formatFilterDisplayValue(filter)}
            </div>
          ))}
        </div>
      );
    }
  }
  return defaultFormatParameterValue(parameter, value, datasetParamItems);
}
