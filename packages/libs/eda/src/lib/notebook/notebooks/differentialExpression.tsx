import { colors } from '@material-ui/core';
import { GENOMICS_PROJECTS } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { AnalysisState, Filter } from '../../core';
import { plugins } from '../../core/components/computations/plugins';
import {
  GENE_EXPRESSION_STABLE_IDS,
  GENE_EXPRESSION_VALUE_IDS,
} from '../../core/components/computations/Utils';
import { VolcanoPlotConfig } from '../../core/components/visualizations/implementations/VolcanoPlotVisualization';
import { useFindEntityAndVariable } from '../../core/hooks/workspace';
import { DifferentialExpressionConfig } from '../../core/types/apps';
import { PresetNotebook, TextCellContext } from '../Types';
import { ReviewCard, ReviewRow } from '../components/ReviewCard';
import { withResolvedSharedInputNames } from './utils';

function isDEReadyToReviewAndSubmit(
  analysisState: AnalysisState | undefined
): boolean {
  const config = analysisState?.analysis?.descriptor.computations.find(
    (c: { descriptor: { type: string } }) =>
      c.descriptor.type === 'differentialexpression'
  )?.descriptor.configuration;
  return plugins['differentialexpression'].isConfigurationComplete(config);
}

function DEReviewContent({
  analysisState,
  wdkState,
  stepNumbers,
}: TextCellContext) {
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

  const sharedInputsStep = stepNumbers?.get('de_shared_inputs');
  const deseq2Step = stepNumbers?.get('de_deseq2_compute');
  const volcanoStep = stepNumbers?.get('de_volcano');

  const isReady = isDEReadyToReviewAndSubmit(analysisState);
  const submitButtonText = wdkState?.submitButtonText ?? 'Get Answer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {isReady && (
        <p style={{ margin: 0 }}>
          Click <strong>"{submitButtonText}"</strong> below to retrieve genes
          matching the criteria below.
        </p>
      )}
      <ReviewCard
        title="Expression Data"
        complete={hasExpressionData}
        incompleteHint={
          sharedInputsStep
            ? `Complete in step ${sharedInputsStep}`
            : 'Complete the expression data step above'
        }
      >
        <ReviewRow
          label="Gene Identifier"
          value={
            identifierVarInfo
              ? `${identifierVarInfo.entity.displayName} > ${identifierVarInfo.variable.displayName}`
              : '—'
          }
        />
        <ReviewRow
          label="Count type"
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
            : 'Complete the DESeq2 configuration step above'
        }
      >
        <ReviewRow
          label="Metadata variable"
          value={comparatorVarInfo?.variable.displayName ?? '—'}
        />
        <ReviewRow label="Reference group (A)" value={groupALabels ?? '—'} />
        <ReviewRow label="Comparison group (B)" value={groupBLabels ?? '—'} />
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

export const differentialExpressionNotebook: PresetNotebook = {
  name: 'differentialexpression',
  displayName: 'Differential Expression Notebook',
  projects: [
    ...GENOMICS_PROJECTS,
    'UniDB' /* 'MicrobiomeDB' probably inappropriate */,
  ],
  cells: withResolvedSharedInputNames([
    {
      id: 'de_subset',
      type: 'subset',
      title: 'Select Samples (optional)',
      initialPanelState: 'closed',
      numberedHeader: true,
      helperText: (
        <span>
          Optionally remove samples, e.g. outliers identified in the PCA step
          below.
        </span>
      ),
    },
    {
      id: 'de_shared_inputs',
      type: 'sharedcomputeinputs',
      title: 'Select Expression Data',
      computationIds: ['pca_1', 'de_1'],
      inputNames: ['identifierVariable', 'valueVariable'],
      inputs: [
        {
          name: 'identifierVariable',
          label: 'Gene Identifier',
          role: 'axis',
          titleOverride: 'Expression Data',
        },
        {
          name: 'valueVariable',
          label: 'Count type',
          role: 'axis',
        },
      ],
      constraints: [
        {
          identifierVariable: {
            isRequired: true,
            minNumVars: 1,
            maxNumVars: 1,
            allowedVariableIds: [GENE_EXPRESSION_STABLE_IDS.IDENTIFIER],
          },
          valueVariable: {
            isRequired: true,
            minNumVars: 1,
            maxNumVars: 1,
            allowedVariableIds: [...GENE_EXPRESSION_VALUE_IDS],
          },
        },
      ],
      dataElementDependencyOrder: [['identifierVariable', 'valueVariable']],
      numberedHeader: true,
      helperText: (
        <span>Select the gene expression data for this analysis.</span>
      ),
    },
    {
      id: 'de_pca_compute',
      type: 'compute',
      title: 'Set up PCA Computation',
      computationName: 'dimensionalityreduction',
      computationId: 'pca_1',
      sharedInputsCellId: 'de_shared_inputs',
      numberedHeader: true,
      helperText: (
        <span>
          Configure and run a PCA to explore sources of variation across
          samples.
        </span>
      ),
      cells: [
        {
          id: 'de_pca_plot',
          type: 'visualization',
          title: 'PCA Plot',
          visualizationName: 'scatterplot',
          visualizationId: 'pca_1',
          numberedHeader: true,
          helperText: (
            <span>
              Color samples by metadata variables to explore batch effects and
              other sources of variation.
            </span>
          ),
        },
      ],
    },
    {
      id: 'de_deseq2_compute',
      type: 'compute',
      title: 'Set up DESeq2 Computation',
      computationName: 'differentialexpression',
      computationId: 'de_1',
      sharedInputsCellId: 'de_shared_inputs',
      numberedHeader: true,
      helperText: (
        <span>
          Configure and run DESeq2 to test for differential expression between
          two groups of samples. Select a metadata variable, then define the
          reference and comparison groups.
        </span>
      ),
      cells: [
        {
          id: 'de_volcano',
          type: 'visualization',
          title: 'Examine DESeq2 Results with Volcano Plot',
          visualizationName: 'volcanoplot',
          visualizationId: 'volcano_1',
          numberedHeader: true,
          helperText: (
            <span>
              Use the threshold lines to highlight genes by significance and
              fold change.
            </span>
          ),
        },
        {
          id: 'de_review',
          type: 'text',
          title: 'Review and Run Search',
          numberedHeader: true,
          helperText: (
            <span>Review your thresholds and run the gene search.</span>
          ),
          panelStateResolver: ({ analysisState }: TextCellContext) =>
            isDEReadyToReviewAndSubmit(analysisState) ? 'open' : 'closed',
          text: ({ analysisState, wdkState, stepNumbers }: TextCellContext) => (
            <DEReviewContent
              analysisState={analysisState}
              wdkState={wdkState}
              stepNumbers={stepNumbers}
            />
          ),
        },
      ],
    },
  ]),
  isReady: ({ analysisState }) => isDEReadyToReviewAndSubmit(analysisState),
};
