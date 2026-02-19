// Notebook presets

import { ReactNode } from 'react';
import { colors } from '@material-ui/core';
import { BipartiteNetworkOptions } from '../core/components/visualizations/implementations/BipartiteNetworkVisualization';
import { NodeData } from '@veupathdb/components/lib/types/plots/network';
import { WdkState, ReadinessContext } from './Types';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';
import { AnalysisState, CollectionVariableTreeNode } from '../core';
import { plugins } from '../core/components/computations/plugins';
import {
  VolcanoPlotConfig,
  VolcanoPlotOptions,
} from '../core/components/visualizations/implementations/VolcanoPlotVisualization';
import { InputSpec } from '../core/components/visualizations/InputVariables';
import { DataElementConstraintRecord } from '../core/utils/data-element-constraints';
import {
  GENE_EXPRESSION_STABLE_IDS,
  GENE_EXPRESSION_VALUE_IDS,
} from '../core/components/computations/Utils';

// this is currently not used but may be one day when we need to store user state
// that is outside AnalysisState and WdkState
export const NOTEBOOK_UI_STATE_KEY = '@@NOTEBOOK_WDK_PARAMS@@';

// The descriptors contain just enough information to render the cells when given the
// appropriate context, such as analysis state.
export type NotebookCellDescriptor =
  | VisualizationCellDescriptor
  | ComputeCellDescriptor
  | TextCellDescriptor
  | SubsetCellDescriptor
  | WdkParamCellDescriptor
  | SharedComputeInputsCellDescriptor;

export interface NotebookCellDescriptorBase<T extends string> {
  id: string; // Unique identifier for this cell. Used as key in stepNumbers map.
  type: T;
  title: string;
  cells?: NotebookCellDescriptor[];
  numberedHeader?: boolean; // If true, helperText will be rendered inside a NumberedHeader with an auto-computed step number
  helperText?: ReactNode; // Optional information to display above the cell. Instead of a full text cell, use this for quick help and titles.
}

type EnqueueSnackbar = ReturnType<typeof useSnackbar>['enqueueSnackbar'];

export interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  visualizationId: string;
  // Custom function that allows us to override visualization Options from the notebook preset.
  // Useful for adding interactivity between the viz and other notebook cells.
  getVizPluginOptions?: (
    wdkState: WdkState,
    enqueueSnackbar: EnqueueSnackbar,
    stepNumbers?: Map<string, number>
  ) => Partial<BipartiteNetworkOptions> | Partial<VolcanoPlotOptions>; // We'll define this function custom for each notebook, so can expand output types as needed.
}

export interface ComputeCellDescriptor
  extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
  computationId: string;
  getAdditionalCollectionPredicate?: (
    projectId?: string
  ) => (variableCollection: CollectionVariableTreeNode) => boolean;
  hidden?: boolean; // Whether to hide this computation cell in the UI. Useful for computations where the entire configuration is already known.
  sharedInputNames?: string[]; // Input names managed by a SharedComputeInputsNotebookCell. Plugins render these as read-only.
  sharedInputsCellId?: string; // ID of the SharedComputeInputsCell that owns sharedInputNames. Used to auto-collapse this cell when shared inputs are not yet set.
}

export interface TextCellContext {
  analysisState: AnalysisState;
  wdkState?: WdkState;
  stepNumbers?: Map<string, number>;
}

export interface TextCellDescriptor extends NotebookCellDescriptorBase<'text'> {
  text: ReactNode | ((context: TextCellContext) => ReactNode);
}

export interface SubsetCellDescriptor
  extends NotebookCellDescriptorBase<'subset'> {}

export interface WdkParamCellDescriptor
  extends NotebookCellDescriptorBase<'wdkparam'> {
  paramNames: string[]; // Param names from the wdk query. These must match exactly or the notebook will err.
  requiredParamNames?: string[]; // Subset of paramNames that are required. Labels will be red with an asterisk until filled.
}

export interface SharedComputeInputsCellDescriptor
  extends NotebookCellDescriptorBase<'sharedcomputeinputs'> {
  computationIds: string[]; // Computation IDs whose configs will be updated (e.g. ['pca_1', 'de_1'])
  inputNames: string[]; // Config property names this cell manages (e.g. ['identifierVariable', 'valueVariable'])
  inputs: InputSpec[]; // Passed to InputVariables for rendering
  constraints?: DataElementConstraintRecord[];
  dataElementDependencyOrder?: string[][];
}

type PresetNotebook = {
  name: string;
  displayName: string;
  projects: string[];
  cells: NotebookCellDescriptor[];
  header?:
    | string
    | ((context: {
        submitButtonText: string;
        stepNumbers: Map<string, number>;
      }) => string); // Optional header text for the notebook, to be displayed above the cells.
  isReady?: (context: ReadinessContext) => boolean;
};

// Preset notebooks
// Note - Using differential abundance as practice for differential expression
// Note - boxplot notebook has no plan for use yet, just good for testing.
export const presetNotebooks: Record<string, PresetNotebook> = {
  differentialExpressionNotebook: {
    name: 'differentialexpression',
    displayName: 'Differential Expression Notebook',
    projects: [
      'AmoebaDB',
      'CryptoDB',
      'FungiDB',
      'GiardiaDB',
      'HostDB',
      'MicrosporidiaDB',
      'PiroplasmaDB',
      'PlasmoDB',
      'ToxoDB',
      'TrichDB',
      'TriTrypDB',
      'VectorBase',
      'UniDB',
      'MicrobiomeDB',
    ],
    cells: [
      {
        id: 'de_subset',
        type: 'subset',
        title: 'Select samples (optional)',
        numberedHeader: true,
        helperText: (
          <span>Optionally refine samples for differential expression.</span>
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
          <span>
            Select the gene expression data to use for PCA and differential
            expression analysis.
          </span>
        ),
      },
      {
        id: 'de_pca_compute',
        type: 'compute',
        title: 'PCA',
        computationName: 'dimensionalityreduction',
        computationId: 'pca_1',
        sharedInputNames: ['identifierVariable', 'valueVariable'],
        sharedInputsCellId: 'de_shared_inputs',
        numberedHeader: true,
        helperText: (
          <span>
            Use PCA to investigate possible sources of variation in the dataset.
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
                Use PCA to investigate possible sources of variation in the
                dataset.
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
        sharedInputNames: ['identifierVariable', 'valueVariable'],
        sharedInputsCellId: 'de_shared_inputs',
        numberedHeader: true,
        helperText: (
          <span>
            Run a differential expression analysis using DESeq2. Choose the
            metadata variable for comparison, and then set up the reference and
            comparison groups. When all selections have been made, we can run
            the computation.
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
                Once the DESeq2 results are ready, a volcano plot will appear
                below. Set the threshold lines to color the genes based on their
                significance and fold change.
              </span>
            ),
          },
          {
            id: 'de_review',
            type: 'text',
            title: 'Review and run search',
            numberedHeader: true,
            helperText: (
              <span>
                After identifying genes of interest from the volcano plot, run a
                gene search to review the genes in the Gene Search Results
                table.
              </span>
            ),
            text: ({
              analysisState,
              wdkState,
              stepNumbers,
            }: TextCellContext) => {
              const submitButtonText =
                wdkState?.submitButtonText ?? 'Get Answer';

              // Extra guards for dynamic threshold content
              if (!analysisState.analysis?.descriptor?.computations?.length) {
                return <div>No analysis configuration available</div>;
              }
              const differentialExpressionComputation =
                analysisState.analysis.descriptor.computations.find(
                  (c) => c.descriptor.type === 'differentialexpression'
                );
              if (!differentialExpressionComputation?.visualizations?.length) {
                return <div>No visualization configuration available</div>;
              }

              const volcanoPlotConfig =
                differentialExpressionComputation.visualizations[0].descriptor
                  .configuration;

              if (
                !volcanoPlotConfig ||
                !VolcanoPlotConfig.is(volcanoPlotConfig)
              ) {
                return <div>No configuration</div>;
              }

              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <h4>
                    Clicking "{submitButtonText}" below will return genes that
                    meet the following criteria:
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5em',
                      marginTop: '0.5em',
                    }}
                  >
                    <span>
                      Absolute effect size:{' '}
                      <strong>{volcanoPlotConfig.effectSizeThreshold}</strong>
                    </span>
                    <span>
                      Unadjusted P-value:{' '}
                      <strong>{volcanoPlotConfig.significanceThreshold}</strong>
                    </span>
                    <span>
                      Gene regulation direction:{' '}
                      <strong>Up and down regulated</strong>
                    </span>
                    <span
                      style={{
                        fontStyle: 'italic',
                        color: colors.grey[800],
                        marginTop: '0.5em',
                      }}
                    >
                      To make adjustments, update the volcano plot settings in
                      step {stepNumbers?.get('de_volcano') ?? 'above'}.
                    </span>
                  </div>
                </div>
              );
            },
          },
        ],
      },
    ],
    isReady: ({ analysisState }) => {
      const config = analysisState?.analysis?.descriptor.computations.find(
        (c: { descriptor: { type: string } }) =>
          c.descriptor.type === 'differentialexpression'
      )?.descriptor.configuration;
      return plugins['differentialexpression'].isConfigurationComplete(config);
    },
  },
  // WGCNA - only for plasmo. No subsetting cells because of the pre-computed modules and eigengenes.
  // Will be primed and prettified in https://github.com/VEuPathDB/web-monorepo/issues/1381
  wgcnaCorrelationNotebook: {
    name: 'wgcnacorrelation',
    displayName: 'WGCNA Correlation Notebook',
    header: ({ submitButtonText, stepNumbers }) =>
      `Use steps 1-${
        stepNumbers.get('wgcna_params') ?? '?'
      } to find a module of interest, then click '${submitButtonText}' to retrieve a list of genes.`,
    projects: ['PlasmoDB', 'HostDB', 'UniDB'],
    cells: [
      {
        id: 'wgcna_correlation_compute',
        type: 'compute',
        title: 'Correlation computation',
        computationName: 'correlation',
        computationId: 'correlation_1',
        numberedHeader: true,
        helperText: (
          <span>
            Configure and run a correlation computation between WGCNA module
            eigengene expression and other features of interest.
          </span>
        ),
        getAdditionalCollectionPredicate:
          (projectId?: string) =>
          (variableCollection: CollectionVariableTreeNode) => {
            // Keep only the plasmo eigengenes for plasmodb...
            if (projectId === 'PlasmoDB') {
              return variableCollection.id === 'EUPATH_0005051';
            }
            // ... and host eigengenes for hostdb
            if (projectId === 'HostDB') {
              return variableCollection.id === 'EUPATH_0005050';
            }
            // If we're in the portal, should return both.
            return true;
          },
        cells: [
          {
            id: 'wgcna_bipartite',
            type: 'visualization',
            title: 'Network visualization of correlation results',
            visualizationName: 'bipartitenetwork',
            visualizationId: 'bipartite_1',
            numberedHeader: true,
            helperText: (
              <span>
                Visualize the correlation results between the two groups in the
                network. Click on nodes to highlight them in the network.
              </span>
            ),
            getVizPluginOptions: (
              wdkState: WdkState,
              enqueueSnackbar: EnqueueSnackbar,
              stepNumbers?: Map<string, number>
            ) => {
              return {
                additionalOnNodeClickAction: (node: NodeData) => {
                  const moduleName = String(node.label ?? '').toLowerCase();

                  // because this function is part of read-only "configuration" we can
                  // hard-code the target parameter name 'wgcnaParam'
                  const param = wdkState.parameters?.find(
                    ({ name }) => name === 'wgcnaParam'
                  );

                  // Early-return type guarding on `param`
                  if (param == null) return;
                  if (param.type !== 'single-pick-vocabulary') return;
                  if (param.displayType === 'treeBox') return; // ← reject the tree-box case
                  if (!param.vocabulary || !Array.isArray(param.vocabulary))
                    return;

                  // Also guard against no updateParamValue (the main point of this callback)
                  if (!wdkState.updateParamValue) return;

                  // Do nothing if the node they clicked on is
                  // not from the group of modules in the param.
                  // Here we assume the structure of the vocabulary coming from the wdk.
                  const allowedValues = param.vocabulary.filter(
                    (item): item is [string, string, null] =>
                      Array.isArray(item) && item.length === 3
                  );
                  if (allowedValues.length === 0) return;

                  // Match the clicked node to a vocabulary value. The node label
                  // (e.g. "module_4_17nov2025_pfal3d7") may be a suffix of the
                  // vocabulary value (e.g. "p_module_4_17nov2025_pfal3d7") due to
                  // a data-side prefix, so use case-insensitive endsWith for
                  // matching but preserve the original vocabulary value for the
                  // param update.
                  const matchedEntry = allowedValues.find((item) => {
                    const v = item[0].toLowerCase();
                    return v === moduleName || v.endsWith('_' + moduleName);
                  });
                  if (!matchedEntry) return;
                  const matchedValue = matchedEntry[0];

                  // Do nothing if the module they clicked on is already selected.
                  const currentValue = wdkState.paramValues?.[param.name];
                  if (
                    typeof currentValue === 'string' &&
                    currentValue.toLowerCase() === moduleName
                  ) {
                    return;
                  }

                  // Update module name in the wdk param store
                  wdkState.updateParamValue(param, matchedValue);

                  // Open snackbar
                  const paramStep = stepNumbers?.get('wgcna_params') ?? '?';
                  enqueueSnackbar(
                    <span>
                      Updated WGCNA module search parameter in step {paramStep}{' '}
                      to: <strong>{matchedValue}</strong>
                    </span>,
                    { variant: 'info' }
                  );
                },
              };
            },
          },
        ],
      },
      {
        id: 'wgcna_params',
        type: 'wdkparam',
        title: 'Run gene search',
        paramNames: ['wgcnaParam', 'wgcna_correlation_cutoff'],
        requiredParamNames: ['wgcnaParam'],
        numberedHeader: true,
        helperText: (
          <span>
            Find genes within a particular module that are strongly correlated
            with the module&apos;s eigengene.
          </span>
        ),
      },
    ],
    isReady: ({ wdkState }) => {
      if (!wdkState) return false;
      const value = wdkState.paramValues['wgcnaParam'];
      // Target wgcnaParam's index-zero makeshift placeholder ("1_choose_module" => "Choose a Module")
      if (value == null || value === '' || value.includes('choose_module'))
        return false;
      return true;
    },
  },
  boxplotNotebook: {
    name: 'boxplot',
    displayName: 'Boxplot Notebook',
    projects: ['MicrobiomeDB'],
    cells: [
      {
        id: 'boxplot_viz',
        type: 'visualization',
        title: 'Boxplot Visualization',
        visualizationName: 'boxplot',
        visualizationId: 'boxplot_1',
      },
    ],
  },
};

// Type guards
export function isVisualizationCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is VisualizationCellDescriptor {
  return cellDescriptor.type === 'visualization';
}

export function isTextCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is TextCellDescriptor {
  return cellDescriptor.type === 'text';
}

export function isComputeCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is ComputeCellDescriptor {
  return cellDescriptor.type === 'compute';
}

export function isSharedComputeInputsCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is SharedComputeInputsCellDescriptor {
  return cellDescriptor.type === 'sharedcomputeinputs';
}

export function isSubsetCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is SubsetCellDescriptor {
  return cellDescriptor.type === 'subset';
}
