// Notebook presets

export interface NotebookCellDescriptorBase<T extends string> {
  type: T;
  title: string;
  cells?: (
    | VisualizationCellDescriptor
    | ComputeCellDescriptor
    | TextCellDescriptor
  )[];
}

export interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  computationName: string;
}

export interface ComputeCellDescriptor
  extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
}

export interface TextCellDescriptor extends NotebookCellDescriptorBase<'text'> {
  text: string;
}

type PresetNotebook = {
  name: string;
  displayName: string;
  projects: string[];
  cells: (
    | VisualizationCellDescriptor
    | ComputeCellDescriptor
    | TextCellDescriptor
  )[];
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
        cells: [
          {
            type: 'visualization',
            title: 'Volcano Plot',
            visualizationName: 'volcanoplot',
            computationName: 'differentialabundance',
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
            computationName: 'correlation',
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
        computationName: 'pass',
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
