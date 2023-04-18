import { NumberOrDateRange } from '../../types/general';
import { ScatterPlotData } from '../../types/plots';
import { min, max, lte, gte } from 'lodash';
import {
  gradientSequentialColorscaleMap,
  gradientDivergingColorscaleMap,
} from '../../types/plots/addOns';
import { scaleLinear } from 'd3-scale';

// set data array types for VEuPathDB scatter plot: https://redmine.apidb.org/issues/41310
// but changed to new format: most likely x & y data are row/column vector format; also standardError is not a single value but vector
export interface VEuPathDBScatterPlotData {
  scatterplot: {
    data: Array<{
      seriesX?: number[] | string[]; // perhaps string[] is better despite Date format, e.g., ISO format?
      seriesY?: number[] | string[]; // will y data have a Date?
      smoothedMeanX?: number[] | string[]; // perhaps string[] is better despite Date format, e.g., ISO format?
      smoothedMeanY?: number[]; // will y data have a date string? Nope, number only
      smoothedMeanSE?: number[];
      bestFitLineX?: number[] | string[];
      bestFitLineY?: number[];
      seriesGradientColorscale?: number[] | string[];
    }>;
  };
}

/**
 * Many example scatter plots can be made with toy data. Define some toy data here.
 */

const nPoints = 300;
let sequentialIntegers = [];
for (let index = 0; index < nPoints; index++) {
  sequentialIntegers.push(index);
}
// Random integers of low cardinality
const randomIntegers = sequentialIntegers.map(
  (i) => Math.ceil(Math.random() * 7) // 7 is arbitrary. Matches value in Colors.stories.
);
// Arrays of random values
const randomPosValues = sequentialIntegers.map((i) =>
  Math.abs(getNormallyDistributedRandomNumber(0, 1))
);
const randPosNegvalues = sequentialIntegers.map(() =>
  getNormallyDistributedRandomNumber(0, 1)
);
const randNegvalues = sequentialIntegers.map(
  () => -Math.abs(getNormallyDistributedRandomNumber(0, 1))
);

// Scatterplot data with random positive overlay values
export const dataSetSequentialGradient: VEuPathDBScatterPlotData = {
  scatterplot: {
    data: [
      {
        seriesX: randPosNegvalues,
        seriesY: randNegvalues,
        seriesGradientColorscale: randomPosValues,
      },
    ],
  },
};

// Scatterplot data data with random, discrete integers in 1:7 for the overlay values.
export const dataSetSequentialDiscrete: VEuPathDBScatterPlotData = {
  scatterplot: {
    data: [
      {
        seriesX: randomPosValues,
        seriesY: randPosNegvalues,
        seriesGradientColorscale: randomIntegers,
      },
    ],
  },
};

// Scatterplot data with random, normally distributed values for overlay.
export const dataSetDivergingGradient: VEuPathDBScatterPlotData = {
  scatterplot: {
    data: [
      {
        seriesX: randomPosValues,
        seriesY: randNegvalues,
        seriesGradientColorscale: randPosNegvalues,
      },
    ],
  },
};

// Scatterplot data with 8 series so we can use the eight colors of the categorical colormap.
// Using only a small number of points (suggest nPoints/2) so that the plot doesn't get too crazy crowded.
export const dataSetCategoricalOverlay: VEuPathDBScatterPlotData = {
  scatterplot: {
    data: [
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
      {
        seriesX: sequentialIntegers.slice(nPoints / 2),
        seriesY: sequentialIntegers
          .slice(nPoints / 2)
          .map((i) => Math.random()),
      },
    ],
  },
};

// use actual data response format (number/string) following scatter plot data API
export const dataSet: VEuPathDBScatterPlotData = {
  scatterplot: {
    data: [
      {
        // scatter plot with CI
        seriesX: [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
          '30',
          '31',
          '32',
          '33',
          '34',
          '35',
          '36',
          '37',
          '38',
          '39',
          '40',
          '41',
          '42',
          '43',
          '44',
          '46',
          '47',
        ],
        seriesY: [
          '0.58',
          '0.54',
          '0.43',
          '0.86',
          '1.19',
          '1.47',
          '0.98',
          '1.36',
          '0.58',
          '0.82',
          '0.77',
          '1.22',
          '2.21',
          '0.46',
          '1.55',
          '1.38',
          '0.98',
          '1.4',
          '1.29',
          '1.3',
          '1.56',
          '1.73',
          '1.48',
          '1.38',
          '1.1',
          '1.14',
          '0.84',
          '1.12',
          '1.07',
          '1.1',
          '0.73',
          '0.86',
          '1.16',
          '1.02',
          '0.77',
          '1.04',
          '0.57',
          '0.08',
          '0.2',
          '0.4',
          '0.23',
          '0.13',
          '-0.51',
          '0',
          '-0.35',
          '0.21',
          '-0.08',
        ],
        // popupContent?: string;   // this prop is placed at each object, {x, y, popupContent}, but not tested
        smoothedMeanX: [
          '0',
          '0.5949367',
          '1.1898734',
          '1.7848101',
          '2.3797468',
          '2.9746835',
          '3.5696203',
          '4.164557',
          '4.7594937',
          '5.3544304',
          '5.9493671',
          '6.5443038',
          '7.1392405',
          '7.7341772',
          '8.3291139',
          '8.9240506',
          '9.5189873',
          '10.1139241',
          '10.7088608',
          '11.3037975',
          '11.8987342',
          '12.4936709',
          '13.0886076',
          '13.6835443',
          '14.278481',
          '14.8734177',
          '15.4683544',
          '16.0632911',
          '16.6582278',
          '17.2531646',
          '17.8481013',
          '18.443038',
          '19.0379747',
          '19.6329114',
          '20.2278481',
          '20.8227848',
          '21.4177215',
          '22.0126582',
          '22.6075949',
          '23.2025316',
          '23.7974684',
          '24.3924051',
          '24.9873418',
          '25.5822785',
          '26.1772152',
          '26.7721519',
          '27.3670886',
          '27.9620253',
          '28.556962',
          '29.1518987',
          '29.7468354',
          '30.3417722',
          '30.9367089',
          '31.5316456',
          '32.1265823',
          '32.721519',
          '33.3164557',
          '33.9113924',
          '34.5063291',
          '35.1012658',
          '35.6962025',
          '36.2911392',
          '36.8860759',
          '37.4810127',
          '38.0759494',
          '38.6708861',
          '39.2658228',
          '39.8607595',
          '40.4556962',
          '41.0506329',
          '41.6455696',
          '42.2405063',
          '42.835443',
          '43.4303797',
          '44.0253165',
          '44.6202532',
          '45.2151899',
          '45.8101266',
          '46.4050633',
          '47',
        ],
        smoothedMeanY: [
          0.5785742, 0.62672442, 0.67323618, 0.71814504, 0.76148657, 0.80329633,
          0.84360987, 0.88246277, 0.91989058, 0.95593748, 0.9906337, 1.02392407,
          1.05574679, 1.08604006, 1.11474209, 1.1417911, 1.16712527, 1.19068283,
          1.21240197, 1.23233582, 1.25106432, 1.26858248, 1.28477776,
          1.29953759, 1.31274943, 1.32430073, 1.33407893, 1.34197147,
          1.34786582, 1.35163861, 1.35316678, 1.35253669, 1.34986715,
          1.34527693, 1.33888484, 1.33080965, 1.32117016, 1.31008516,
          1.29767344, 1.28403089, 1.26893232, 1.25223203, 1.23385632, 1.2137315,
          1.19178388, 1.16793976, 1.14212545, 1.11426725, 1.08429147,
          1.05204324, 1.01595307, 0.97602739, 0.93304169, 0.88777145,
          0.84099215, 0.79347928, 0.74600833, 0.69935477, 0.6542941, 0.61154602,
          0.56925692, 0.52625652, 0.48261979, 0.43842174, 0.39373736,
          0.34864164, 0.30320957, 0.25751615, 0.21163636, 0.16564487,
          0.11954102, 0.07326909, 0.02679829, -0.01990212, -0.0668629,
          -0.11411483, -0.16168865, -0.20961514, -0.25792504, -0.30664913,
        ],
        smoothedMeanSE: [
          0.17707248, 0.16235568, 0.14874309, 0.13631127, 0.12513697,
          0.11529107, 0.10682941, 0.09978058, 0.09413275, 0.08982227,
          0.08673276, 0.08472218, 0.08363165, 0.08329509, 0.08354947,
          0.08424304, 0.08524034, 0.08642434, 0.08769652, 0.08891579,
          0.08974583, 0.09031039, 0.09083636, 0.09151829, 0.09246373,
          0.09366216, 0.09498058, 0.09618371, 0.09697145, 0.09698261, 0.0958602,
          0.09411663, 0.09241673, 0.09133085, 0.09120903, 0.0920902, 0.09369136,
          0.09548291, 0.09681067, 0.09702663, 0.09595857, 0.0941586, 0.09226917,
          0.0908584, 0.09030512, 0.09070753, 0.09185823, 0.0933012, 0.09444301,
          0.09469448, 0.09409325, 0.09303255, 0.09183424, 0.09076517, 0.089992,
          0.08955262, 0.08935269, 0.0891909, 0.08880915, 0.08797016, 0.08692468,
          0.08591592, 0.08501907, 0.08432286, 0.08393048, 0.08395982,
          0.08454239, 0.0858203, 0.08794106, 0.09105076, 0.09529446, 0.10077931,
          0.10755986, 0.11564935, 0.12502808, 0.13565382, 0.14747146,
          0.16042048, 0.17443995, 0.18947155,
        ],
      },
      {
        // line plot with marker
        seriesX: [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
        ],
        seriesY: [
          '-1',
          '-0.8',
          '-0.4',
          '0',
          '0.5',
          '0.8',
          '1.3',
          '1.7',
          '2.0',
          '2.3',
          '2.7',
          '3.5',
          '4.0',
          '4.5',
          '4.7',
          '4.7',
          '4.6',
          '4.0',
          '3.5',
          '2.7',
          '2.3',
          '2.0',
          '1.7',
          '1.3',
          '0.8',
          '0.5',
          '0',
          '-0.4',
          '-0.67',
          '-1',
        ],
      },
      {
        // line plot with marker
        seriesX: [
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
          '30',
          '31',
          '32',
          '33',
          '34',
          '35',
          '36',
          '37',
          '38',
          '39',
          '40',
          '41',
          '42',
          '43',
          '44',
          '45',
          '46',
          '47',
        ],
        seriesY: [
          '-1',
          '-0.8',
          '-0.7',
          '-0.5',
          '-0.2',
          '0',
          '0.5',
          '0.8',
          '1.2',
          '1.5',
          '2.3',
          '2.6',
          '2.9',
          '3.0',
          '2.85',
          '2.6',
          '2.0',
          '1.5',
          '1.2',
          '1.0',
          '0.8',
          '0.4',
          '0',
          '-0.3',
          '-0.6',
          '-0.7',
          '-0.8',
          '-1',
        ],
      },
    ],
  },
};

// a sample data for testing Date format: ISO format only
export const dateStringDataSet: VEuPathDBScatterPlotData = {
  scatterplot: {
    data: [
      // Case 2-1) X: date string; Y: number
      {
        // not sorted X
        seriesX: [
          '2012-05-01',
          '2013-01-01',
          '2012-01-05',
          '2014-01-11',
          '2015-07-31',
          '2016-07-18',
          '2017-12-20',
          '2018-01-01',
          '2019-01-01',
          '2020-01-11',
        ],
        seriesY: ['2', '3', '1', '4', '5', '6', '7', '8', '9', '10'],
        // not sorted X
        smoothedMeanX: [
          '2012-08-01',
          '2013-06-01',
          '2014-01-11',
          '2015-05-31',
          '2012-03-05',
          '2016-02-18',
          '2017-10-20',
          '2018-04-01',
          '2019-07-01',
          '2019-12-11',
        ],
        smoothedMeanY: [2.2, 3.3, 4.4, 5.5, 1.1, 6.6, 7.7, 8.8, 9.2, 9.5],
        smoothedMeanSE: [
          0.145, 0.2, 0.11, 0.5, 0.1, 0.24, 0.7, 0.33, 0.45, 0.55,
        ],
      },

      // // Case 2-2) X: number string; Y: date string
      // // // In this case, smoothedMean and bestfitline have response error from backend anyway
      // {
      //   // not sorted X
      //   seriesY: ['2012-05-01', '2013-01-01', '2012-01-05', '2014-01-11', '2015-07-31', '2016-07-18', '2017-12-20', '2018-01-01', '2019-01-01','2020-01-11' ],
      //   seriesX: ["2","3","1","4","5","6","7","8","9","10"],
      //   // // not sorted X
      //   // smoothedMeanX: ['2012-08-01', '2013-06-01', '2014-01-11', '2015-05-31', '2012-03-05','2016-02-18', '2017-10-20', '2018-04-01', '2019-07-01', '2019-12-11' ],
      //   // smoothedMeanY: [2.2,3.3,4.4,5.5,1.1,6.6,7.7,8.8,9.2,9.5],
      //   // smoothedMeanSE: [0.145,0.2,0.11,0.5,0.1,0.24,0.7,0.33,0.45,0.55],
      // },
    ],
  },
};

// making plotly input data
export function processInputData<T extends number | string>(
  dataSet: any,
  vizType: string,
  // line, marker,
  modeValue: string,
  // send independentValueType & dependentValueType
  independentValueType: string,
  dependentValueType: string,
  defineColors: boolean,
  colorPaletteOverride?: string[]
) {
  // set fillAreaValue for densityplot
  const fillAreaValue = vizType === 'densityplot' ? 'toself' : '';

  // distinguish data per Viztype
  // currently, lineplot returning scatterplot, not lineplot
  const plotDataSet =
    vizType === 'lineplot'
      ? dataSet.scatterplot
      : vizType === 'densityplot'
      ? // set densityplot as scatterplot for this example
        // ? dataSet.densityplot
        dataSet.scatterplot
      : dataSet.scatterplot;

  // set variables for x- and yaxis ranges
  let yMin: number | string | undefined = 0;
  let yMax: number | string | undefined = 0;

  // coloring: using plotly.js default colors instead of web-components default palette
  const markerColors = colorPaletteOverride ?? [
    'rgb(31, 119, 180)', //'#1f77b4',  // muted blue
    'rgb(255, 127, 14)', //'#ff7f0e',  // safety orange
    'rgb(44, 160, 44)', //'#2ca02c',  // cooked asparagus green
    'rgb(214, 39, 40)', //'#d62728',  // brick red
    'rgb(148, 103, 189)', //'#9467bd',  // muted purple
    'rgb(140, 86, 75)', //'#8c564b',  // chestnut brown
    'rgb(227, 119, 194)', //'#e377c2',  // raspberry yogurt pink
    'rgb(127, 127, 127)', //'#7f7f7f',  // middle gray
    'rgb(188, 189, 34)', //'#bcbd22',  // curry yellow-green
    'rgb(23, 190, 207)', //'#17becf'   // blue-teal
  ];

  // set dataSetProcess as any
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  plotDataSet.data.forEach(function (el: any, index: number) {
    // initialize seriesX/Y
    let seriesX = [];
    let seriesY = [];

    // initialize gradient colorscale arrays
    let seriesGradientColorscale = [];
    let markerColorsGradient = [];

    // series is for scatter plot
    if (el.seriesX && el.seriesY) {
      // check the number of x = number of y
      if (el.seriesX.length !== el.seriesY.length) {
        // alert('The number of X data is not equal to the number of Y data');
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      /*
        For raw data, there are two cases:
          a) X: number string; Y: date string
          b) X: date string; Y: number string
        For the case of b), smoothed mean and best fit line option would get backend response error
      **/
      if (independentValueType === 'date') {
        seriesX = el.seriesX;
      } else {
        seriesX = el.seriesX.map(Number);
      }
      if (dependentValueType === 'date') {
        seriesY = el.seriesY;
      } else {
        seriesY = el.seriesY.map(Number);
      }

      // check if this Y array consists of numbers & add type assertion
      if (index === 0) {
        // if (seriesY && seriesY !== undefined) {
        yMin = min(seriesY);
        yMax = max(seriesY);
        // }
      } else {
        yMin =
          // (yMin !== undefined && seriesY.length !== 0 && yMin < min(seriesY)) ? yMin : min(seriesY);
          lte(yMin, min(seriesY)) ? yMin : min(seriesY);
        yMax = gte(yMax, max(seriesY)) ? yMax : max(seriesY);
      }

      // If seriesGradientColorscale column exists, need to use gradient colorscales
      if (el.seriesGradientColorscale) {
        // Assuming only allowing numbers for now - later will add dates
        seriesGradientColorscale = el.seriesGradientColorscale.map(Number);

        // For storybook only - determine overlayMin, overlayMax, and gradientColorscaleType inside processInputData
        // In web-eda, these need to be determined *outside* of this function so that we handle facets correctly.
        let overlayMin: number | undefined;
        let overlayMax: number | undefined;
        let gradientColorscaleType: string | undefined;

        const defaultOverlayMin: number = min(
          seriesGradientColorscale
        ) as number;
        const defaultOverlayMax: number = max(
          seriesGradientColorscale
        ) as number;
        // Note overlayMin and/or overlayMax could be intentionally 0.
        gradientColorscaleType =
          defaultOverlayMin >= 0 && defaultOverlayMax >= 0
            ? 'sequential'
            : defaultOverlayMin <= 0 && defaultOverlayMax <= 0
            ? 'sequential reversed'
            : 'divergent';

        // Update overlay min and max
        if (gradientColorscaleType === 'divergent') {
          overlayMin = -Math.max(
            Math.abs(defaultOverlayMin),
            Math.abs(defaultOverlayMax)
          );
          overlayMax = Math.max(
            Math.abs(defaultOverlayMin),
            Math.abs(defaultOverlayMax)
          );
        } else {
          overlayMin = defaultOverlayMin;
          overlayMax = defaultOverlayMax;
        }
        // -- end for storybook only code section

        // Determine marker colors
        if (
          gradientColorscaleType &&
          (overlayMin || overlayMin === 0) &&
          overlayMax
        ) {
          // If we have data, use a gradient colorscale. No data series will have all NaN values in seriesGradientColorscale

          // Initialize normalization function.
          const normalize = scaleLinear();

          if (gradientColorscaleType === 'divergent') {
            // Diverging colorscale, assume 0 is midpoint. Colorscale must be symmetric around the midpoint
            const maxAbsOverlay =
              Math.abs(overlayMin) > overlayMax
                ? Math.abs(overlayMin)
                : overlayMax;

            // For each point, normalize the data to [-1, 1], then retrieve the corresponding color
            normalize.domain([-maxAbsOverlay, maxAbsOverlay]).range([-1, 1]);
            markerColorsGradient = seriesGradientColorscale.map((a: number) =>
              gradientDivergingColorscaleMap(normalize(a))
            );
          } else if (gradientColorscaleType === 'sequntial reverse') {
            // Normalize data to [1, 0], so that the colorscale goes in reverse. NOTE: can remove once we add the ability for users to set colorscale range.
            normalize.domain([overlayMin, overlayMax]).range([1, 0]);
            markerColorsGradient = seriesGradientColorscale.map((a: number) =>
              gradientSequentialColorscaleMap(normalize(a))
            );
            gradientColorscaleType = 'sequential';
          } else {
            // Then we use the sequential (from 0 to inf) colorscale.
            // For each point, normalize the data to [0, 1], then retrieve the corresponding color
            normalize.domain([overlayMin, overlayMax]).range([0, 1]);
            markerColorsGradient = seriesGradientColorscale.map((a: number) =>
              gradientSequentialColorscaleMap(normalize(a))
            );
            gradientColorscaleType = 'sequential';
          }
        }
      }

      // add scatter data considering input options
      dataSetProcess.push({
        x: seriesX,
        y: seriesY,
        // distinguish X/Y Data from Overlay
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value
          : 'Data',
        mode: modeValue,
        type:
          vizType === 'lineplot'
            ? 'scatter'
            : vizType === 'densityplot'
            ? 'scatter'
            : 'scattergl', // for the raw data of the scatterplot
        fill: fillAreaValue,
        marker: {
          color:
            defineColors || colorPaletteOverride
              ? markerColors[index]
              : seriesGradientColorscale?.length > 0
              ? markerColorsGradient
              : undefined,
          size: 12,
          line: {
            color:
              defineColors || colorPaletteOverride
                ? markerColors[index]
                : seriesGradientColorscale?.length > 0
                ? markerColorsGradient
                : undefined,
            width: 2,
          },
          symbol: 'circle',
        },
        // this needs to be here for the case of markers with line or lineplot.
        // always use spline?
        line: {
          color: defineColors ? 'rgb(' + markerColors[index] + ')' : undefined,
          shape: 'spline',
        },
      });
    }
  });

  // after drawing raw data, smoothedMean and bestfitline plots are displayed
  plotDataSet.data.forEach(function (el: any, index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xIntervalLineValue: T[] = [];
    let yIntervalLineValue: number[] = [];
    let standardErrorValue: number[] = []; // this is for standardError

    let xIntervalBounds: T[] = [];
    let yIntervalBounds: number[] = [];

    // initialize smoothedMeanX, bestFitLineX
    let smoothedMeanX = [];
    let bestFitLineX = [];

    // check if smoothedMean prop exists
    if (el.smoothedMeanX && el.smoothedMeanY && el.smoothedMeanSE) {
      // check the number of x = number of y or standardError
      if (el.smoothedMeanX.length !== el.smoothedMeanY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      // change string array to number array for numeric data
      // smoothedMeanX = el.smoothedMeanX.map(Number);
      if (independentValueType === 'date') {
        smoothedMeanX = el.smoothedMeanX;
      } else {
        smoothedMeanX = el.smoothedMeanX.map(Number);
      }
      // smoothedMeanY/SE are number[]

      // the date format, yyyy-mm-dd works with sort, so no change in the following is required
      // sorting function
      //1) combine the arrays: including standardError
      let combinedArrayInterval = [];
      for (let j = 0; j < smoothedMeanX.length; j++) {
        combinedArrayInterval.push({
          xValue: smoothedMeanX[j],
          yValue: el.smoothedMeanY[j],
          zValue: el.smoothedMeanSE[j],
        });
      }
      //2) sort:
      combinedArrayInterval.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue === b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArrayInterval.length; k++) {
        xIntervalLineValue[k] = combinedArrayInterval[k].xValue;
        yIntervalLineValue[k] = combinedArrayInterval[k].yValue;
        standardErrorValue[k] = combinedArrayInterval[k].zValue;
      }

      // add additional condition for the case of smoothedMean (without series data)
      yMin = el.seriesY
        ? lte(yMin, min(yIntervalLineValue))
          ? yMin
          : min(yIntervalLineValue)
        : min(yIntervalLineValue);
      yMax = el.seriesY
        ? gte(yMax, max(yIntervalLineValue))
          ? yMax
          : max(yIntervalLineValue)
        : max(yIntervalLineValue);

      // store data for smoothed mean: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        // name: 'Smoothed mean',
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + '<br>Smoothed mean'
          : 'Smoothed mean',
        mode: 'lines', // no data point is displayed: only line
        line: {
          color: defineColors
            ? 'rgba(' + markerColors[index] + ',1)'
            : undefined,
          shape: 'spline',
          width: 2,
        },
        // use scattergl
        type: 'scattergl',
      });

      // make Confidence Interval (CI) or Bounds (filled area)
      xIntervalBounds = xIntervalLineValue;
      xIntervalBounds = xIntervalBounds.concat(
        xIntervalLineValue.map((element: any) => element).reverse()
      );

      // finding upper and lower bound values.
      const { yUpperValues, yLowerValues } = getBounds(
        yIntervalLineValue,
        standardErrorValue
      );

      // make upper and lower bounds plotly format
      yIntervalBounds = yUpperValues;
      yIntervalBounds = yIntervalBounds.concat(
        yLowerValues.map((element: any) => element).reverse()
      );

      // set variables for x-/y-axes ranges including CI/bounds: no need for x data as it was compared before
      yMin = lte(yMin, min(yLowerValues)) ? yMin : min(yLowerValues);
      yMax = gte(yMax, max(yLowerValues)) ? yMax : max(yLowerValues);

      // store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        // name: '95% Confidence interval',
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + '<br>95% Confidence interval'
          : '95% Confidence interval',
        // this is better to be tozeroy, not tozerox
        fill: 'tozeroy',
        fillcolor: defineColors
          ? 'rgba(' + markerColors[index] + ',0.2)'
          : undefined,
        // type: 'line',
        type: 'scattergl',
        // here, line means upper and lower bounds
        line: {
          color: defineColors ? 'transparent' : undefined,
          shape: 'spline',
        },
      });
    }

    // accomodating bestFitLineWithRaw
    // check if bestFitLineX/Y props exist
    if (el.bestFitLineX && el.bestFitLineY) {
      // check the number of x = number of y
      if (el.bestFitLineX.length !== el.bestFitLineY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      // change string array to number array for numeric data
      if (independentValueType === 'date') {
        bestFitLineX = el.bestFitLineX;
      } else {
        bestFitLineX = el.bestFitLineX.map(Number);
      }

      // add additional condition for the case of smoothedMean (without series data)
      yMin = el.seriesY
        ? lte(yMin, min(el.bestFitLineY))
          ? yMin
          : min(el.bestFitLineY)
        : min(el.bestFitLineY);
      yMax = el.seriesY
        ? gte(yMax, max(el.bestFitLineY))
          ? yMax
          : max(el.bestFitLineY)
        : max(el.bestFitLineY);

      // store data for fitting line: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: bestFitLineX,
        y: el.bestFitLineY,
        // display R-square value at legend text(s)
        // name: 'Best fit<br>R<sup>2</sup> = ' + el.r2,
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + '<br>R<sup>2</sup> = ' + el.r2
          : 'Best fit<br>R<sup>2</sup> = ' + el.r2,
        mode: 'lines', // no data point is displayed: only line
        line: {
          color: defineColors
            ? 'rgba(' + markerColors[index] + ',1)'
            : undefined,
          shape: 'spline',
        },
        // use scattergl
        type: 'scattergl',
      });
    }
  });

  // make some margin for y-axis range (5% of range for now)
  if (typeof yMin == 'number' && typeof yMax == 'number') {
    yMin = yMin - (yMax - yMin) * 0.05;
    yMax = yMax + (yMax - yMin) * 0.05;
  } else {
    // set yMin/yMax to be NaN so that plotly uses autoscale for date type
    yMin = NaN;
    yMax = NaN;
  }

  return { dataSetProcess: { series: dataSetProcess }, yMin, yMax };
}

/*
 * Utility functions for processInputData()
 */

function getBounds<T extends number | Date>(
  values: T[],
  standardErrors: T[]
): {
  yUpperValues: T[];
  yLowerValues: T[];
} {
  const yUpperValues = values.map((value, idx) => {
    const tmp = Number(value) + 2 * Number(standardErrors[idx]);
    return value instanceof Date ? (new Date(tmp) as T) : (tmp as T);
  });
  const yLowerValues = values.map((value, idx) => {
    const tmp = Number(value) - 2 * Number(standardErrors[idx]);
    return value instanceof Date ? (new Date(tmp) as T) : (tmp as T);
  });

  return { yUpperValues, yLowerValues };
}

// Copied from https://mika-s.github.io/javascript/random/normal-distributed/2019/05/15/generating-normally-distributed-random-numbers-in-javascript.html
function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

  return { z0, z1 };
}

export function getNormallyDistributedRandomNumber(
  mean: number,
  stddev: number
) {
  const { z0, z1 } = boxMullerTransform();

  return z0 * stddev + mean;
}
