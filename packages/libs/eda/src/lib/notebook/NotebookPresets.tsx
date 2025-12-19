// Notebook presets

import { ReactNode } from 'react';
import NumberedHeader from '@veupathdb/coreui/lib/components/forms/NumberedHeader';
import { colors } from '@material-ui/core';
import { BipartiteNetworkOptions } from '../core/components/visualizations/implementations/BipartiteNetworkVisualization';
import { NodeData } from '@veupathdb/components/lib/types/plots/network';
import { WdkState } from './EdaNotebookAnalysis';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';
import { AnalysisState, CollectionVariableTreeNode } from '../core';
import {
  VolcanoPlotConfig,
  VolcanoPlotOptions,
} from '../core/components/visualizations/implementations/VolcanoPlotVisualization';

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
  | WdkParamCellDescriptor;

export interface NotebookCellDescriptorBase<T extends string> {
  type: T;
  title: string;
  cells?: NotebookCellDescriptor[];
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
    enqueueSnackbar: EnqueueSnackbar
  ) => Partial<BipartiteNetworkOptions> | Partial<VolcanoPlotOptions>; // We'll define this function custom for each notebook, so can expand output types as needed.
}

export interface ComputeCellDescriptor
  extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
  computationId: string;
  getAdditionalCollectionPredicate?: (
    projectId?: string
  ) => (variableCollection: CollectionVariableTreeNode) => boolean;
}

export interface TextCellDescriptor extends NotebookCellDescriptorBase<'text'> {
  text: ReactNode;
  getDynamicContent?: (analysisState: AnalysisState) => ReactNode;
}

export interface SubsetCellDescriptor
  extends NotebookCellDescriptorBase<'subset'> {}

export interface WdkParamCellDescriptor
  extends NotebookCellDescriptorBase<'wdkparam'> {
  paramNames: string[]; // Param names from the wdk query. These must match exactly or the notebook will err.
}

type PresetNotebook = {
  name: string;
  displayName: string;
  projects: string[];
  cells: NotebookCellDescriptor[];
  header?: string; // Optional header text for the notebook, to be displayed above the cells.
};

// Preset notebooks
// Note - Using differential abundance as practice for differential expression
// Note - boxplot notebook has no plan for use yet, just good for testing.
export const presetNotebooks: Record<string, PresetNotebook> = {
  differentialExpressionNotebook: {
    name: 'differentialexpression',
    displayName: 'Differential Expression Notebook',
    projects: ['PlasmoDB', 'MicrobiomeDB'],
    cells: [
      {
        type: 'subset',
        title: 'Select samples (optional)',
        helperText: (
          <NumberedHeader
            number={1}
            text={'Optionally refine samples for differential expression.'}
            color={colors.grey[800]}
          />
        ),
      },
      {
        type: 'compute',
        title: 'Configure PCA',
        computationName: 'dimensionalityreduction',
        computationId: 'pca_1',
        helperText: (
          <NumberedHeader
            number={2}
            text={
              'Use PCA to investigate possible sources of variation in the dataset.'
            }
            color={colors.grey[800]}
          />
        ),
        cells: [
          {
            type: 'visualization',
            title: 'PCA Plot',
            visualizationName: 'scatterplot',
            visualizationId: 'pca_1',
          },
        ],
      },
      {
        type: 'compute',
        title: 'Setup DESeq2 Computation',
        computationName: 'differentialexpression',
        computationId: 'de_1',
        helperText: (
          <NumberedHeader
            number={3}
            text={
              'Run a differential expression analysis using DESeq2. Please choose the metadata variable for comparison, and then set up the reference and comparison groups. When all selections have been made, we can run the computation.'
            }
            color={colors.grey[800]}
          />
        ),
        cells: [
          {
            type: 'visualization',
            title: 'Examine DESeq2 Results with Volcano Plot',
            visualizationName: 'volcanoplot',
            visualizationId: 'volcano_1',
            getVizPluginOptions: (
              wdkState: WdkState,
              enqueueSnackbar: EnqueueSnackbar
            ) => {
              return {
                // When user changes viz config, show snackbar with updated params
                inputSnackbar: <K extends keyof VolcanoPlotConfig>(
                  enqueueSnackbar: EnqueueSnackbar,
                  vizConfigParameter: K,
                  newValue: VolcanoPlotConfig[K]
                ) => {
                  let paramText = '';
                  // The only two parameters we want to alert the user about are numbers.
                  if (typeof newValue === 'number') {
                    switch (vizConfigParameter) {
                      case 'effectSizeThreshold':
                        paramText = 'Absolute effect size';
                        break;
                      case 'significanceThreshold':
                        paramText = 'Unadjusted P-value';
                        break;
                      default:
                        paramText = 'Unknown parameter';
                    }
                    enqueueSnackbar(
                      <span>
                        Updated <strong>{paramText}</strong> search parameter in
                        step 3 to: <strong>{newValue}</strong>
                      </span>,
                      { variant: 'info' }
                    );
                  }
                },
              };
            },
            helperText: (
              <NumberedHeader
                number={4}
                text={
                  'Once the DESeq2 results are ready, a volcano plot will appear below. Set the threshold lines to color the genes based on their significance and fold change.'
                }
                color={colors.grey[800]}
              />
            ),
          },
          {
            type: 'text',
            title: 'Review and run search',
            helperText: (
              <NumberedHeader
                number={5}
                text={
                  'After identifying genes of interest from the volcano plot, run a gene search to review the genes in the Gene Search Results table.'
                }
                color={colors.grey[800]}
              />
            ),
            text: (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <h4>
                  Clicking "Get Answer" below will return genes that meet the
                  following criteria:
                </h4>
              </div>
            ),
            getDynamicContent: (analysisState: AnalysisState) => {
              // Extra guards
              if (!analysisState.analysis?.descriptor?.computations?.length) {
                return <div>No analysis configuration available</div>;
              }
              const differentialExpressionComputation =
                analysisState.analysis.descriptor.computations[1];
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
                    step 3.
                  </span>
                </div>
              );
            },
          },
        ],
      },
    ],
  },
  // WGCNA - only for plasmo. No subsetting cells because of the pre-computed modules and eigengenes.
  // Will be primed and prettified in https://github.com/VEuPathDB/web-monorepo/issues/1381
  wgcnaCorrelationNotebook: {
    name: 'wgcnacorrelation',
    displayName: 'WGCNA Correlation Notebook',
    header:
      "Use steps 1-3 to find a module of interest, then click 'Get Answer' to retrieve a list of genes.",
    projects: ['PlasmoDB', 'HostDB'],
    cells: [
      {
        type: 'compute',
        title: 'Correlation computation',
        computationName: 'correlation',
        computationId: 'correlation_1',
        helperText: (
          <NumberedHeader
            number={1}
            text={
              'Configure and run a correlation computation between WGCNA module eigengene expression and other features of interest.'
            }
            color={colors.grey[800]}
          />
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
            type: 'visualization',
            title: 'Network visualization of correlation results',
            visualizationName: 'bipartitenetwork',
            visualizationId: 'bipartite_1',
            helperText: (
              <NumberedHeader
                number={2}
                text={
                  'Visualize the correlation results between the two groups in the network. Click on nodes to highlight them in the network.'
                }
                color={colors.grey[800]}
              />
            ),
            getVizPluginOptions: (
              wdkState: WdkState,
              enqueueSnackbar: EnqueueSnackbar
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
                  const allowedValues = param.vocabulary
                    .filter(
                      (item): item is [string, string, null] =>
                        Array.isArray(item) && item.length === 3
                    )
                    .map((item: [string, string, null]) =>
                      item[0].toLowerCase()
                    );
                  if (allowedValues.length === 0) return;
                  if (!allowedValues.includes(moduleName)) {
                    // TO DO: notify user if they've clicked on a "wrong" node? Needs UX.
                    return;
                  }

                  // Do nothing if the module they clicked on is already selected.
                  const currentValue = wdkState.paramValues?.[param.name];
                  if (
                    typeof currentValue === 'string' &&
                    currentValue.toLowerCase() === moduleName
                  ) {
                    return;
                  }

                  // Update module name in the wdk param store
                  wdkState.updateParamValue(param, moduleName);

                  // Open snackbar
                  enqueueSnackbar(
                    <span>
                      Updated WGNCA module search parameter in step 3 to:{' '}
                      <strong>{moduleName}</strong>
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
        type: 'wdkparam',
        title: 'Run gene search',
        paramNames: ['wgcnaParam', 'wgcna_correlation_cutoff'],
        helperText: (
          <NumberedHeader
            number={3}
            text={
              "Find genes within a particular module that are strongly correlated with the module's eigengene."
            }
            color={colors.grey[800]}
          />
        ),
      },
    ],
  },
  boxplotNotebook: {
    name: 'boxplot',
    displayName: 'Boxplot Notebook',
    projects: ['MicrobiomeDB'],
    cells: [
      {
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

export function isSubsetCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is SubsetCellDescriptor {
  return cellDescriptor.type === 'subset';
}
