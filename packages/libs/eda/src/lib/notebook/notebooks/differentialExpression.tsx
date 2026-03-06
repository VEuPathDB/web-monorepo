import { GENOMICS_PROJECTS } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import {
  GENE_EXPRESSION_STABLE_IDS,
  GENE_EXPRESSION_VALUE_IDS,
} from '../../core/components/computations/Utils';
import { PresetNotebook, TextCellContext } from '../Types';
import { withResolvedSharedInputNames } from './utils';
import {
  isDEReadyToReviewAndSubmit,
  DifferentialAnalysisReviewContent,
} from './differentialAnalysisReview';

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
          label: 'Gene identifier',
          role: 'axis',
          titleOverride: 'Expression Data',
        },
        {
          name: 'valueVariable',
          label: 'Measurement type',
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
      configOverrides: { dataFormat: 'rawCounts' as const },
      readonlyInputNames: ['dataFormat'],
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
          // RNA-Seq annotations generally don't have missing data
          // so we keep the user interface as simple as possible
          getVizPluginOptions: () => ({ hideCoverageData: true }),
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
            <DifferentialAnalysisReviewContent
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
