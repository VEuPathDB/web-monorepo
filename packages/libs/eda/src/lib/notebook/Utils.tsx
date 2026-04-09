// Utils

import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { defaultFormatParameterValue } from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';
import { DatasetItem } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';
import { Analysis, NewAnalysis } from '../core';
import { AnalysisDescriptor } from '../core/types/analysis';
import { Computation } from '../core/types/visualization';
import { DifferentialExpressionConfig } from '../core/types/apps';
import { VolcanoPlotConfig } from '../core/components/visualizations/implementations/VolcanoPlotVisualization';
import { formatFilterDisplayValue } from '../core/utils/study-metadata';
import { ReviewCard, ReviewRow } from './components/ReviewCard';

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

/**
 * Step-details formatter for EDA notebook questions.
 * Shows subset filters and a human-readable summary of each computation.
 */
export function formatEdaNotebookParameterValue(
  parameter: Parameter,
  value: string | undefined,
  datasetParamItems: Record<string, DatasetItem[]> | undefined
) {
  if (parameter.name === 'eda_analysis_spec' && value != null) {
    const obj = parseJson(value);
    if (NewAnalysis.is(obj) || Analysis.is(obj)) {
      return <EdaNotebookAnalysisSummary descriptor={obj.descriptor} />;
    }
  }
  return defaultFormatParameterValue(parameter, value, datasetParamItems);
}

function EdaNotebookAnalysisSummary({
  descriptor,
}: {
  descriptor: AnalysisDescriptor;
}) {
  const filters = descriptor.subset.descriptor;
  const computations = descriptor.computations;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {filters.length === 0 ? (
        <em>No filters applied.</em>
      ) : (
        <div style={{ whiteSpace: 'pre-line' }}>
          {filters.map((filter, i) => (
            <div key={i}>
              {filter.variableId}: {formatFilterDisplayValue(filter)}
            </div>
          ))}
        </div>
      )}
      {computations.map((comp) => (
        <ComputationSummary key={comp.computationId} computation={comp} />
      ))}
    </div>
  );
}

function ComputationSummary({ computation }: { computation: Computation }) {
  const { type, configuration } = computation.descriptor;

  if (type === 'differentialexpression') {
    const config = DifferentialExpressionConfig.is(configuration)
      ? configuration
      : undefined;
    const groupALabels =
      config?.comparator?.groupA?.map((r) => r.label).join(', ') ?? '—';
    const groupBLabels =
      config?.comparator?.groupB?.map((r) => r.label).join(', ') ?? '—';
    const vizConfig =
      computation.visualizations?.[0]?.descriptor?.configuration;
    const volcanoConfig = VolcanoPlotConfig.is(vizConfig)
      ? vizConfig
      : undefined;
    return (
      <ReviewCard title="Differential Expression">
        <ReviewRow label="Reference group (A)" value={groupALabels} />
        <ReviewRow label="Comparison group (B)" value={groupBLabels} />
        {volcanoConfig?.effectSizeThreshold != null && (
          <ReviewRow
            label="|Effect size| ≥"
            value={String(volcanoConfig.effectSizeThreshold)}
          />
        )}
        {volcanoConfig?.significanceThreshold != null && (
          <ReviewRow
            label="p-value ≤"
            value={String(volcanoConfig.significanceThreshold)}
          />
        )}
      </ReviewCard>
    );
  }

  // Fallback for other computation types — no UI, but log for developers
  console.warn(
    `EdaNotebookStepDetails: no summary renderer for computation type "${type}"`
  );
  return null;
}
