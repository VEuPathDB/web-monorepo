// Notebook presets

import { ComputationPlugin } from '../core/components/computations/Types';
import { plugin as differentialabundance } from '../core/components/computations/plugins/differentialabundance';
import { plugin as correlation } from '../core/components/computations/plugins/correlation';

type PresetNotebook = {
  name: string;
  displayName: string;
  computationName: string; // Let's assume one computation for now. Eventually could send an object with nested comp/viz info
  visualizations: string[];
  projects: string[];
  plugin: ComputationPlugin;
  // cells: NotebookCell[]; // This could be used to define a preset notebook with cells already defined.
};

// For the differential expression (faking with diff abund right now)
export const differentialAbundanceNotebook: PresetNotebook = {
  name: 'differentialabundance',
  displayName: 'Differential Abundance Notebook',
  computationName: 'differentialabundance',
  visualizations: ['volcanoplot'], // Note this could be different than what's listed for the workspace app.
  projects: ['MicrobiomeDB'],
  plugin: differentialabundance,
};

// For correlation it might look like this.
// Correlation might be the first example of asking for multiple vizs or even
// multiple computes on one notebook
export const wgcnaCorrelationNotebook: PresetNotebook = {
  name: 'wgcnacorrelation',
  displayName: 'WGCNA Correlation Notebook',
  computationName: 'correlation',
  visualizations: ['bipartitenetwork'],
  projects: ['MicrobiomeDB'],
  plugin: correlation,
};

export const boxplotNotebook: PresetNotebook = {
  name: 'boxplot',
  displayName: 'Boxplot Notebook',
  computationName: 'pass',
  visualizations: ['boxplot'],
  projects: ['MicrobiomeDB'],
  plugin: correlation,
};
