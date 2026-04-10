// Utils

import { useMemo } from 'react';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { defaultFormatParameterValue } from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';
import { DatasetItem } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';
import { Analysis, NewAnalysis } from '../core';
import { AnalysisDescriptor } from '../core/types/analysis';
import { Computation } from '../core/types/visualization';
import { DifferentialExpressionConfig } from '../core/types/apps';
import { VolcanoPlotConfig } from '../core/components/visualizations/implementations/VolcanoPlotVisualization';
import {
  entityTreeToArray,
  findEntityAndVariable,
} from '../core/utils/study-metadata';
import { StudyEntity } from '../core/types/study';
import { formatFilterValue } from '../core/utils/filter-display';
import { ReviewCard, ReviewRow } from './components/ReviewCard';
import { useStudyMetadata } from '../core/hooks/study';
import { useConfiguredSubsettingClient } from '../core/hooks/client';

export function parseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

/**
 * Factory that returns a step-details formatter for the `eda_analysis_spec`
 * WDK parameter. Pass the EDA service URL from the application layer.
 */
export function makeFormatEdaAnalysisSpec(edaServiceUrl: string) {
  return function formatEdaAnalysisSpec(
    parameter: Parameter,
    value: string | undefined,
    datasetParamItems: Record<string, DatasetItem[]> | undefined
  ) {
    if (parameter.name === 'eda_analysis_spec' && value != null) {
      const obj = parseJson(value);
      if (NewAnalysis.is(obj) || Analysis.is(obj)) {
        return (
          <EdaNotebookAnalysisSummary
            edaServiceUrl={edaServiceUrl}
            studyId={obj.studyId}
            descriptor={obj.descriptor}
          />
        );
      }
    }
    return defaultFormatParameterValue(parameter, value, datasetParamItems);
  };
}

function EdaNotebookAnalysisSummary({
  edaServiceUrl,
  studyId,
  descriptor,
}: {
  edaServiceUrl: string;
  studyId: string;
  descriptor: AnalysisDescriptor;
}) {
  const filters = descriptor.subset.descriptor;
  const computations = descriptor.computations;

  const client = useConfiguredSubsettingClient(edaServiceUrl);
  // studyId here is actually the WDK dataset ID; useStudyMetadata resolves it
  // to the EDA study ID via the permissions API before fetching metadata.
  const studyMetadata = useStudyMetadata(studyId, client);
  const entities = useMemo(
    () =>
      studyMetadata.value
        ? entityTreeToArray(studyMetadata.value.rootEntity)
        : undefined,
    [studyMetadata.value]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {filters.length === 0 ? (
        <em>No filters applied.</em>
      ) : (
        <ReviewCard title="Filters">
          {filters.map((filter, i) => {
            const ev = entities
              ? findEntityAndVariable(entities, {
                  entityId: filter.entityId,
                  variableId: filter.variableId,
                })
              : undefined;
            const label = ev
              ? `${ev.entity.displayName} > ${ev.variable.displayName}`
              : entities == null
              ? 'Loading...'
              : filter.variableId;
            return (
              <ReviewRow
                key={i}
                label={label}
                value={formatFilterValue(filter, entities ?? [])}
              />
            );
          })}
        </ReviewCard>
      )}
      {computations.map((comp) => (
        <ComputationSummary
          key={comp.computationId}
          computation={comp}
          entities={entities}
        />
      ))}
    </div>
  );
}

function ComputationSummary({
  computation,
  entities,
}: {
  computation: Computation;
  entities: StudyEntity[] | undefined;
}) {
  const { type, configuration } = computation.descriptor;

  if (type === 'differentialexpression') {
    const config = DifferentialExpressionConfig.is(configuration)
      ? configuration
      : undefined;
    const comparatorVarInfo =
      config?.comparator?.variable && entities
        ? findEntityAndVariable(entities, config.comparator.variable)
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
        <ReviewRow
          label="Metadata variable"
          value={comparatorVarInfo?.variable.displayName ?? '—'}
        />
        <ReviewRow label="Reference group (A)" value={groupALabels} />
        <ReviewRow label="Comparison group (B)" value={groupBLabels} />
        {volcanoConfig?.effectSizeThreshold != null && (
          <ReviewRow
            label={`|${volcanoConfig.effectSizeLabel ?? 'Effect size'}| ≥`}
            value={String(volcanoConfig.effectSizeThreshold)}
          />
        )}
        {volcanoConfig?.significanceThreshold != null && (
          <ReviewRow
            label="p-value ≤"
            value={String(volcanoConfig.significanceThreshold)}
          />
        )}
        <ReviewRow
          label="Direction"
          value={
            volcanoConfig?.effectDirection === 'up only'
              ? 'Up-regulated only'
              : volcanoConfig?.effectDirection === 'down only'
              ? 'Down-regulated only'
              : 'Up- or down-regulated'
          }
        />
      </ReviewCard>
    );
  }

  // Fallback for other computation types — no UI, but log for developers
  console.warn(
    `EdaNotebookStepDetails: no summary renderer for computation type "${type}"`
  );
  return null;
}
