// Notebook presets

import { ComputationPlugin } from '../core/components/computations/Types';
import { plugin as differentialabundance } from '../core/components/computations/plugins/differentialabundance';
import { plugin as correlation } from '../core/components/computations/plugins/correlation';
import { NotebookCell } from './Types';

// export type NotebookCellDescriptor = {
//   title: string;
//   subCells?: (
//     | VisualizationCellDescriptor
//     | ComputeCellDescriptor
//     | TextCellDescriptor
//   )[];
// };
export interface NotebookCellDescriptorBase<T extends string> {
  type: T;
  title: string;
  subCells?: (
    | VisualizationCellDescriptor
    | ComputeCellDescriptor
    | TextCellDescriptor
  )[];
}

interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  computationName: string;
}

interface ComputeCellDescriptor extends NotebookCellDescriptorBase<'compute'> {
  plugin: ComputationPlugin;
  computationName: string;
}

interface TextCellDescriptor extends NotebookCellDescriptorBase<'text'> {
  text: string;
}

type PresetNotebook = {
  name: string;
  displayName: string;
  projects: string[];
  skeleton: (
    | VisualizationCellDescriptor
    | ComputeCellDescriptor
    | TextCellDescriptor
  )[];
};

// For the differential expression (faking with diff abund right now)
export const differentialAbundanceNotebook: PresetNotebook = {
  name: 'differentialabundance',
  displayName: 'Differential Abundance Notebook',
  projects: ['MicrobiomeDB'],
  skeleton: [
    {
      type: 'compute',
      title: 'diff abund title',
      computationName: 'differentialabundance',
      plugin: differentialabundance,
    },
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
    {
      type: 'text',
      title: 'Text Cell',
      text: 'This is a text cell for the differential abundance notebook.',
    },
  ],
};

// For correlation it might look like this.
// Correlation might be the first example of asking for multiple vizs or even
// multiple computes on one notebook
export const wgcnaCorrelationNotebook: PresetNotebook = {
  name: 'wgcnacorrelation',
  displayName: 'WGCNA Correlation Notebook',
  projects: ['MicrobiomeDB'],
  skeleton: [
    {
      type: 'compute',
      title: 'WGCNA Compute Cell',
      computationName: 'correlation',
      plugin: correlation,
    },
    {
      type: 'visualization',
      title: 'Correlation Plot',
      visualizationName: 'bipartiteNetwork',
      computationName: 'correlation',
    },
    // {
    //   type: 'visualization',
    //   title: 'Correlation plot 2',
    //   visualizationName: 'bipartiteNetwork',
    //   computationName: 'correlation',
    // },
    {
      type: 'text',
      title: 'Sub Text Cell',
      text: 'This is a sub text cell for the WGCNA correlation notebook.',
    },
    {
      type: 'text',
      title: 'Text Cell',
      text: 'This is a text cell for the WGCNA correlation notebook.',
    },
  ],
};

// export const boxplotNotebook: PresetNotebook = {
//   name: 'boxplot',
//   displayName: 'Boxplot Notebook',
//   computationName: 'pass',
//   visualizations: ['boxplot'],
//   projects: ['MicrobiomeDB'],
//   plugin: correlation,
// };
