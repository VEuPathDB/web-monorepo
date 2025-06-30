// Notebook presets

import { ReactNode } from 'react';
import { NumberedHeader } from '../workspace/Subsetting/SubsetDownloadModal';
import { colors } from '@material-ui/core';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Options } from '../core/components/visualizations/implementations/BipartiteNetworkVisualization';

const height = 25;
const color = 'black';
// The descriptors contain just enough information to render the cells when given the
// appropriate context, such as analysis state. In EdaNotebookAnalysis, these
// descriptors get converted into cells using the ids and such generated in
// the particular analysis.

export type NotebookCellDescriptor =
  | VisualizationCellDescriptor
  | ComputeCellDescriptor
  | TextCellDescriptor
  | SubsetCellDescriptor
  | WdkParamCellDescriptor;

export interface NotebookCellDescriptorBase<T extends string> {
  type: T;
  title: string;
  cellId: string; // Unique identifier for the cell, used for referencing one cell from another.
  cells?: NotebookCellDescriptor[];
  helperText?: ReactNode; // Optional information to display above the cell. Instead of a full text cell, use this for quick help and titles.
}

export interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  visualizationId: string;
  vizPluginOptions?: Partial<Options>; // Viz plugin option overrides.
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
  wdkParameters?: Parameter[]; // The parameters, including all their details, from the wdk query.
  wdkUpdateParamValue?: (
    parameter: Parameter,
    newParamValue: string,
    paramValues: Record<string, string>
  ) => void; // Function to update the parameter value in the WDK search.
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
        cellId: 'diff_1',
        title: 'Differential Abundance',
        computationName: 'differentialabundance',
        computationId: 'diff_1',
        helperText: (
          <>
            <div
              style={{
                display: 'inline-block',
                width: height + 'px',
                height: height + 'px',
                lineHeight: height + 'px',
                color: color,
                border: '2px solid' + color,
                borderRadius: height + 'px',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'content-box',
                userSelect: 'none',
              }}
            >
              1
            </div>
            <span>
              {' '}
              Configure and run a DESeq2 computation to find differentially
              expressed genes.
            </span>
          </>
        ),
        cells: [
          {
            type: 'visualization',
            title: 'Volcano Plot',
            visualizationName: 'volcanoplot',
            visualizationId: 'volcano_1',
            cellId: 'volcano_1',
          },
        ],
      },
      {
        type: 'text',
        title: 'Text Cell',
        cellId: 'text_1',
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
        cellId: 'correlation_1',
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
            cellId: 'bipartite_1',
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
            vizPluginOptions: {
              additionalOnNodeClickAction: (nodeId: string) => {
                console.log('third times a charm');
              },
            },
          },
        ],
      },
      {
        type: 'wdkparam',
        cellId: 'wdkparam_1',
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
        cellId: 'boxplot_1',
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
