import { barplotVisualization } from '../../visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { histogramVisualization } from '../../visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../../visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  visualizationTypes: {
    testVisualization,
    histogram: histogramVisualization,
    twobytwo: twoByTwoVisualization,
    conttable: contTableVisualization,
    scatterplot: scatterplotVisualization,
    // lineplot: scatterplotVisualization,
    // placeholder for densityplot
    // densityplot: scatterplotVisualization,
    barplot: barplotVisualization,
    boxplot: boxplotVisualization,
  },
};
