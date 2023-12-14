import * as t from 'io-ts';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { histogramVisualization } from '../../visualizations/implementations/HistogramVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationComplete: t.nullType.is,
  createDefaultConfiguration: () => null,
  visualizationPlugins: {
    testVisualization,
    histogram: histogramVisualization,
    // densityplot: scatterplotVisualization,
    boxplot: boxplotVisualization,
  },
};
