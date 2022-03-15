import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  visualizationTypes: {
    testVisualization,
    scatterplot: scatterplotVisualization,
    // lineplot: scatterplotVisualization,
  },
};
