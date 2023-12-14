import { barplotVisualization } from '../../visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../visualizations/implementations/BoxplotVisualization';
import { histogramVisualization } from '../../visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../../visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../visualizations/implementations/LineplotVisualization';
import { mapVisualization } from '../../visualizations/implementations/MapVisualization';
import { testVisualization } from '../../visualizations/implementations/TestVisualization';
import { ComputationPlugin } from '../Types';
import { ZeroConfigWithButton } from '../ZeroConfiguration';
import * as t from 'io-ts';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationComplete: t.nullType.is,
  createDefaultConfiguration: () => null,
  visualizationPlugins: {
    testVisualization,
    histogram: histogramVisualization,
    twobytwo: twoByTwoVisualization,
    conttable: contTableVisualization,
    scatterplot: scatterplotVisualization,
    // considering marginal histogram
    lineplot: lineplotVisualization.withOptions({
      showMarginalHistogram: false,
    }),
    'map-markers': mapVisualization,
    // placeholder for densityplot
    // densityplot: scatterplotVisualization,
    barplot: barplotVisualization,
    boxplot: boxplotVisualization,
  },
};
