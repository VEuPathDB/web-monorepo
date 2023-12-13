import * as t from 'io-ts';
import { barplotVisualization } from '../../visualizations/implementations/BarplotVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../../visualizations/implementations/MosaicVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationComplete: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    testVisualization,
    twobytwo: twoByTwoVisualization,
    conttable: contTableVisualization,
    // lineplot: scatterplotVisualization,
    // placeholder for densityplot
    // densityplot: scatterplotVisualization,
    barplot: barplotVisualization,
  },
};
