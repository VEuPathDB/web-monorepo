import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../visualizations/implementations/LineplotVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfiguration } from '../ZeroConfiguration';
import * as t from 'io-ts';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfiguration,
  isConfigurationComplete: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    testVisualization,
    scatterplot: scatterplotVisualization,
    // considering marginal histogram
    lineplot: lineplotVisualization.withOptions({
      showMarginalHistogram: false,
    }),
  },
};
