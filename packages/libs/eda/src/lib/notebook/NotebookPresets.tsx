// Notebook presets

import { ReactNode } from 'react';
import { NumberedHeader } from '../workspace/Subsetting/SubsetDownloadModal';
import { colors } from '@material-ui/core';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { BipartiteNetworkOptions } from '../core/components/visualizations/implementations/BipartiteNetworkVisualization';
import { updateParamValue } from './WdkParamNotebookCell';
import { AnalysisState } from '../core/hooks/analysis';
import { NodeData } from '@veupathdb/components/lib/types/plots/network';
import { OptionsObject } from 'notistack';
import { UpdateWdkParamValue } from './EdaNotebookAnalysis';

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

export interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  visualizationId: string;
  // Custom function that allows us to override visualization Options from the notebook preset.
  // Useful for adding interactivity between the viz and other notebook cells.
  getVizPluginOptions?: (
    analysisState: AnalysisState,
    updateWdkParamValue: UpdateWdkParamValue,
    param: Parameter,
    enqueueSnackbar: (message: string, options?: OptionsObject) => void // So we can call up a snackbar if we mess wtih the viz.
  ) => Partial<BipartiteNetworkOptions>; // We'll define this function custom for each notebook, so can expand output types as needed.
}

export interface ComputeCellDescriptor
  extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
  computationId: string;
}

export interface TextCellDescriptor extends NotebookCellDescriptorBase<'text'> {
  text: ReactNode;
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
  differentialAbundanceNotebook: {
    name: 'differentialabundance',
    displayName: 'Differential Abundance Notebook',
    projects: ['MicrobiomeDB'],
    cells: [
      {
        type: 'compute',
        title: 'Differential Abundance',
        computationName: 'differentialabundance',
        computationId: 'diff_1',
        cells: [
          {
            type: 'visualization',
            title: 'Volcano Plot',
            visualizationName: 'volcanoplot',
            visualizationId: 'volcano_1',
          },
        ],
      },
      {
        type: 'text',
        title: 'Text Cell',
        text: 'This is a text cell for the differential abundance notebook.',
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
    projects: ['MicrobiomeDB'],
    cells: [
      {
        type: 'compute',
        title: 'Correlation Computation',
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
        cells: [
          {
            type: 'visualization',
            title: 'Network Visualization',
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
              analysisState: AnalysisState,
              updateWdkParamValue: UpdateWdkParamValue,
              param: Parameter,
              enqueueSnackbar: (
                message: string,
                options?: OptionsObject
              ) => void // So we can call up the snackbar.
            ) => {
              return {
                additionalOnNodeClickAction: (node: NodeData) => {
                  const moduleName = (node.label ?? '').toLowerCase();

                  // Do nothing if the node they clicked on is
                  // not from the group of modules in the param.
                  // type Parameter has vocabulary... not sure why it's an issue.
                  // @ts-ignore
                  const allowedValues = param.vocabulary.map(
                    (item: [string, string, null]) => item[0].toLowerCase()
                  );
                  if (!allowedValues.includes(moduleName)) {
                    return;
                  }

                  // Do nothing if the module they clicked on is already selected.
                  const currentValue = (analysisState.analysis?.descriptor
                    .subset.uiSettings[NOTEBOOK_UI_STATE_KEY] ?? {})[
                    'wgcnaParam'
                  ] as string;
                  if (currentValue?.toLowerCase() === moduleName) {
                    return;
                  }

                  // Update module name in the wdk param selector
                  updateParamValue(
                    analysisState,
                    updateWdkParamValue,
                    param
                  ).call(null, moduleName);

                  // Open snackbar
                  enqueueSnackbar(
                    `Updated WGNCA module search parameter: ${moduleName}`,
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
        title: 'Finalize search parameters',
        paramNames: ['wgcnaParam', 'wgcna_correlation_cutoff'],
        helperText: (
          <NumberedHeader
            number={3}
            text={'Refine parameters for returning the list of genes.'}
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
