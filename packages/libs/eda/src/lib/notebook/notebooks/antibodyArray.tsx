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

export const antibodyArrayNotebook: PresetNotebook = {
  name: 'antibodyArrayNotebook',
  displayName: 'Antibody Array Notebook',
  projects: [...GENOMICS_PROJECTS, 'UniDB'],
  cells: withResolvedSharedInputNames([
    {
      id: 'ab_subset',
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
      id: 'ab_shared_inputs',
      type: 'sharedcomputeinputs',
      title: 'Select Antibody Array Data',
      computationIds: ['pca_1', 'de_1'],
      inputNames: ['identifierVariable', 'valueVariable'],
      inputs: [
        {
          name: 'identifierVariable',
          label: 'Gene identifier',
          role: 'axis',
          titleOverride: 'Antibody Data',
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
        <span>Select the antibody array data for this analysis.</span>
      ),
    },
    {
      id: 'ab_pca_compute',
      type: 'compute',
      title: 'Set up PCA Computation',
      computationName: 'dimensionalityreduction',
      computationId: 'pca_1',
      configOverrides: { dataFormat: 'normalizedValues' as const },
      sharedInputsCellId: 'ab_shared_inputs',
      numberedHeader: true,
      helperText: (
        <span>
          Configure and run a PCA to explore sources of variation across
          samples.
        </span>
      ),
      cells: [
        {
          id: 'ab_pca_plot',
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
      id: 'ab_limma_compute',
      type: 'compute',
      title: 'Set up Limma Computation',
      computationName: 'differentialexpression',
      computationId: 'de_1',
      configOverrides: { differentialExpressionMethod: 'limma' },
      sharedInputsCellId: 'ab_shared_inputs',
      numberedHeader: true,
      helperText: (
        <span>
          Configure and run Limma to test for differential protein abundance
          between two groups of samples. Select a metadata variable, then define
          the reference and comparison groups.
        </span>
      ),
      cells: [
        {
          id: 'ab_volcano',
          type: 'visualization',
          title: 'Examine Limma Results with Volcano Plot',
          visualizationName: 'volcanoplot',
          visualizationId: 'volcano_1',
          numberedHeader: true,
          helperText: (
            <span>
              Use the threshold lines to highlight proteins by significance and
              fold change.
            </span>
          ),
        },
        {
          id: 'ab_review',
          type: 'text',
          title: 'Review and Run Search',
          numberedHeader: true,
          helperText: (
            <span>Review your thresholds and run the protein search.</span>
          ),
          panelStateResolver: ({ analysisState }: TextCellContext) =>
            isDEReadyToReviewAndSubmit(analysisState) ? 'open' : 'closed',
          text: ({ analysisState, wdkState, stepNumbers }: TextCellContext) => (
            <DifferentialAnalysisReviewContent
              analysisState={analysisState}
              wdkState={wdkState}
              stepNumbers={stepNumbers}
              expressionDataTitle="Antibody Data"
              identifierLabel="Gene Identifier"
              valueLabel="Signal type"
              sharedInputsCellId="ab_shared_inputs"
              computeCellId="ab_limma_compute"
              volcanoCellId="ab_volcano"
            />
          ),
        },
      ],
    },
  ]),
  isReady: ({ analysisState }) => isDEReadyToReviewAndSubmit(analysisState),
};
