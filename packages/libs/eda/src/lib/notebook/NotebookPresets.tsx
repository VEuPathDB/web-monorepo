// Notebook presets

import { ReactNode } from 'react';

// The descriptors contain just enough information to render the cells when given the
// appropriate context, such as analysis state. In EdaNotebookAnalysis, these
// descriptors get converted into cells using the ids and such generated in
// the particular analysis.

export type NotebookCellDescriptor =
  | VisualizationCellDescriptor
  | ComputeCellDescriptor
  | TextCellDescriptor
  | SubsetCellDescriptor;

export interface NotebookCellDescriptorBase<T extends string> {
  type: T;
  title: string;
  cells?: NotebookCellDescriptor[];
}

export interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  visualizationId: string;
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

type PresetNotebook = {
  name: string;
  displayName: string;
  projects: string[];
  cells: NotebookCellDescriptor[];
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
          {
            type: 'text',
            title: 'Sub Text Cell',
            text: 'This is a sub text cell for the differential abundance notebook.',
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
    projects: ['MicrobiomeDB'],
    cells: [
      {
        type: 'text',
        title: 'Extra help',
        text: 'Some more text for the WGCNA correlation notebook.',
      },
      {
        type: 'compute',
        title: 'WGCNA Correlation',
        computationName: 'correlation',
        computationId: 'correlation_1',
        cells: [
          {
            type: 'text',
            title: 'Using the network plot',
            text: 'Network plot explanation... To Do',
          },
          {
            type: 'visualization',
            title: 'Correlation Plot',
            visualizationName: 'bipartitenetwork',
            visualizationId: 'bipartite_1',
          },
        ],
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
