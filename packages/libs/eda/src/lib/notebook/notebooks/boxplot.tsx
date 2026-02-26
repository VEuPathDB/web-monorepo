import { PresetNotebook } from '../Types';

export const boxplotNotebook: PresetNotebook = {
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
};
