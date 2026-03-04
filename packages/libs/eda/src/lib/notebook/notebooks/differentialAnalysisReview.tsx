import { colors } from '@material-ui/core';
import { plugins } from '../../core/components/computations/plugins';
import { VolcanoPlotConfig } from '../../core/components/visualizations/implementations/VolcanoPlotVisualization';
import { useFindEntityAndVariable } from '../../core/hooks/workspace';
import { DifferentialExpressionConfig } from '../../core/types/apps';
import { AnalysisState, Filter } from '../../core';
import { TextCellContext } from '../Types';
import { ReviewCard, ReviewRow } from '../components/ReviewCard';
import { useGroupCounts } from '../../core/hooks/groupCounts';

export function isDEReadyToReviewAndSubmit(
  analysisState: AnalysisState | undefined
): boolean {
  const config = analysisState?.analysis?.descriptor.computations.find(
    (c: { descriptor: { type: string } }) =>
      c.descriptor.type === 'differentialexpression'
  )?.descriptor.configuration;
  return plugins['differentialexpression'].isConfigurationComplete(config);
}

interface DifferentialAnalysisReviewContentProps extends TextCellContext {
  expressionDataTitle?: string;
  identifierLabel?: string;
  valueLabel?: string;
  sharedInputsCellId?: string;
  computeCellId?: string;
  volcanoCellId?: string;
}

export function DifferentialAnalysisReviewContent({
  analysisState,
  wdkState,
  stepNumbers,
  expressionDataTitle = 'Expression Data',
  identifierLabel = 'Gene Identifier',
  valueLabel = 'Count type',
  sharedInputsCellId = 'de_shared_inputs',
  computeCellId = 'de_deseq2_compute',
  volcanoCellId = 'de_volcano',
}: DifferentialAnalysisReviewContentProps) {
  const deComputation = analysisState?.analysis?.descriptor.computations.find(
    (c) => c.descriptor.type === 'differentialexpression'
  );
  const deConfig = DifferentialExpressionConfig.is(
    deComputation?.descriptor.configuration
  )
    ? (deComputation?.descriptor.configuration as DifferentialExpressionConfig)
    : undefined;

  const volcanoPlotConfig = VolcanoPlotConfig.is(
    deComputation?.visualizations?.[0]?.descriptor?.configuration
  )
    ? (deComputation?.visualizations?.[0]?.descriptor
        ?.configuration as VolcanoPlotConfig)
    : undefined;

  const filters =
    (analysisState?.analysis?.descriptor?.subset?.descriptor as Filter[]) ?? [];
  const findEntityAndVariable = useFindEntityAndVariable(filters);

  const identifierVarInfo = deConfig?.identifierVariable
    ? findEntityAndVariable(deConfig.identifierVariable)
    : undefined;
  const valueVarInfo = deConfig?.valueVariable
    ? findEntityAndVariable(deConfig.valueVariable)
    : undefined;
  const comparatorVarInfo = deConfig?.comparator?.variable
    ? findEntityAndVariable(deConfig.comparator.variable)
    : undefined;

  const hasExpressionData = identifierVarInfo != null && valueVarInfo != null;
  const hasGroupComparison =
    comparatorVarInfo != null &&
    deConfig?.comparator?.groupA != null &&
    deConfig?.comparator?.groupB != null;

  const groupALabels = deConfig?.comparator?.groupA
    ?.map((r) => r.label)
    .join(', ');
  const groupBLabels = deConfig?.comparator?.groupB
    ?.map((r) => r.label)
    .join(', ');

  const { groupACount, groupBCount, groupACountPending, groupBCountPending } =
    useGroupCounts(
      deConfig?.comparator?.variable,
      deConfig?.comparator?.groupA,
      deConfig?.comparator?.groupB,
      filters
    );

  const formatCount = (count: number | undefined, pending: boolean): string => {
    if (pending) return ' (please wait...)';
    if (count == null) return '';
    return ` (${count.toLocaleString()} sample${count !== 1 ? 's' : ''})`;
  };

  const sharedInputsStep = stepNumbers?.get(sharedInputsCellId);
  const deseq2Step = stepNumbers?.get(computeCellId);
  const volcanoStep = stepNumbers?.get(volcanoCellId);

  const isReady = isDEReadyToReviewAndSubmit(analysisState);
  const submitButtonText = wdkState?.submitButtonText ?? 'Get Answer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {isReady && (
        <p style={{ margin: 0 }}>
          Click <strong>"{submitButtonText}"</strong> below to retrieve genes
          matching the following criteria:
        </p>
      )}
      <ReviewCard
        title={expressionDataTitle}
        complete={hasExpressionData}
        incompleteHint={
          sharedInputsStep
            ? `Complete in step ${sharedInputsStep}`
            : 'Complete the expression data step above'
        }
      >
        <ReviewRow
          label={identifierLabel}
          value={
            identifierVarInfo
              ? `${identifierVarInfo.entity.displayName} > ${identifierVarInfo.variable.displayName}`
              : '—'
          }
        />
        <ReviewRow
          label={valueLabel}
          value={
            valueVarInfo
              ? `${valueVarInfo.entity.displayName} > ${valueVarInfo.variable.displayName}`
              : '—'
          }
        />
      </ReviewCard>

      <ReviewCard
        title="Group Comparison"
        complete={hasGroupComparison}
        incompleteHint={
          deseq2Step
            ? `Complete in step ${deseq2Step}`
            : 'Complete the computation configuration step above'
        }
      >
        <ReviewRow
          label="Metadata variable"
          value={comparatorVarInfo?.variable.displayName ?? '—'}
        />
        <ReviewRow
          label="Reference group (A)"
          value={
            groupALabels
              ? groupALabels + formatCount(groupACount, groupACountPending)
              : '—'
          }
        />
        <ReviewRow
          label="Comparison group (B)"
          value={
            groupBLabels
              ? groupBLabels + formatCount(groupBCount, groupBCountPending)
              : '—'
          }
        />
      </ReviewCard>

      <ReviewCard title="Volcano Thresholds">
        <ReviewRow
          label="|Effect size| ≥"
          value={String(volcanoPlotConfig?.effectSizeThreshold ?? '—')}
        />
        <ReviewRow
          label="p-value ≤"
          value={String(volcanoPlotConfig?.significanceThreshold ?? '—')}
        />
        <ReviewRow label="Direction" value="Up and down regulated" />
        {volcanoStep && (
          <p
            style={{
              fontStyle: 'italic',
              color: colors.grey[800],
              margin: '0.5em 0 0',
            }}
          >
            Adjust thresholds in step {volcanoStep}.
          </p>
        )}
      </ReviewCard>
    </div>
  );
}
