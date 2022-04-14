import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { histogramVisualization } from '../../visualizations/implementations/HistogramVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  visualizationTypes: {
    testVisualization,
    histogram: histogramVisualization,
    // densityplot: scatterplotVisualization,
    boxplot: boxplotVisualization,
  },
};
