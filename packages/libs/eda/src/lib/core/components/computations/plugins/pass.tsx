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
import { FloatingLayout } from '../../layouts/FloatingLayout';

export const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationValid: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    testVisualization,
    histogram: histogramVisualization,
    twobytwo: twoByTwoVisualization,
    conttable: contTableVisualization,
    scatterplot: scatterplotVisualization,
    lineplot: lineplotVisualization,
    'map-markers': mapVisualization,
    // placeholder for densityplot
    // densityplot: scatterplotVisualization,
    barplot: barplotVisualization,
    boxplot: boxplotVisualization,
    // or...
    // boxplotVisualization.withOptions({
    //   layoutComponent: FloatingLayout,
    //}), /// TEMPORARY ONLY!!! ///
  },
};
