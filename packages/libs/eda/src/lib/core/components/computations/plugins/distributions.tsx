import * as t from 'io-ts';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { histogramVisualization } from '../../visualizations/implementations/HistogramVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfiguration } from '../ZeroConfiguration';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfiguration,
  isConfigurationComplete: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    testVisualization,
    histogram: histogramVisualization,
    // densityplot: scatterplotVisualization,
    boxplot: boxplotVisualization,
  },
};
