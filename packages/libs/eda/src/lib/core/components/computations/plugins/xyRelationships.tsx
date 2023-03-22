import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../visualizations/implementations/LineplotVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';
import * as t from 'io-ts';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationValid: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    testVisualization,
    scatterplot: scatterplotVisualization,
    lineplot: lineplotVisualization,
  },
};
