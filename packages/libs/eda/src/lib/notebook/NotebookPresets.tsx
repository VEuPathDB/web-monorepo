// Notebook presets

type PresetNotebook = {
  name: string;
  displayName: string;
  computationName: string; // Let's assume one computation for now. Eventually could send an object with nested comp/viz info
  visualizations: string[];
  projects: string[];
};

// For the differential expression (faking with diff abund right now)
export const differentialAbundanceNotebook: PresetNotebook = {
  name: 'differentialabundance',
  displayName: 'Differential Abundance Notebook',
  computationName: 'differentialabundance',
  visualizations: ['volcanoplot'],
  projects: ['MicrobiomeDB'],
};

// For correlation it might look like this.
// Correlation might be the first example of asking for multiple vizs or even
// multiple computes on one notebook
export const wgcnaCorrelationNotebook: PresetNotebook = {
  name: 'wgcnacorrelation',
  displayName: 'WGCNA Correlation Notebook',
  computationName: 'correlationassayassay',
  visualizations: ['bipartitenetwork'],
  projects: ['MicrobiomeDB'],
};
