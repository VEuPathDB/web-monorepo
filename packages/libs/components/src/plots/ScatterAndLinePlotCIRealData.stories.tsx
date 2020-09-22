import React from 'react';
import { action } from '@storybook/addon-actions';
import ScatterAndLinePlotCIReal from './ScatterAndLinePlotCIReal';

export default {
  title: 'Scatter CI Real Data',
  component: ScatterAndLinePlotCIReal,
};

/**
 * DKDK lots of type errors can be categorized as two kinds of errors in the following:
 * a) union type (e.g., x & y with number or Date) and its mathematical operation
 * b) js built-in methods/functions like replace(), concat(), map()
 *
 * Question: should x and y be defined as number[] | string[], not number[] | Date[]?
 *
 * # items that are implemented
 * - simple error checking for the case whether the number of x equal to the number of y
 * - sorting X data (and corresponding Y too), which is necessary for CI plot due to its nature of both ascending and descending format
 * - dynamically setting x-/y-axes ranges for better display: finding min/max and floor()/ceil()
 * - added box (outer) border for the plot
 * - considered a default color (defaultColor) if color props is not inputted
 * - considered global opacity (globalOpacity): changed all color part to use rgba()
 * - considered Date input: but assumed that the Date data is comprised of ISO format, e.g., '2020-01-01T00:00:00Z'
 *   - In this regard, sorting is carefully handled
 *
 * # to-do-list: not necessarily a must-have item as of now
 * - "popupContent" prop is not considered
 * - handling types for union type that causes many type errors
 *
 */

//DKDK set data array types for VEuPathDB scatter plot: https://redmine.apidb.org/issues/41310
// but changed to new format: most likely x & y data are row/column vector format; also standardError is not a single value but vector
interface VEuPathDBScatterPlotData {
  data : Array<{
    series: {
      x: number[] | Date[];   //DKDK perhaps string[] is better despite Date format, e.g., ISO format?
      y: number[] | Date[];   //DKDK will y data have a Date?
      popupContent?: string;
    };
    interval?: {
      x: number[] | Date[];
      y: number[] | Date[];
      orientation: string;
      standardError: number[];
    };
    color?: string;
    label: string;
  }>
  opacity?: number;
}

//DKDK type for hexToRgb function
interface hexProp {
  hex: string
}

//DKDK change HTML hex code to rgb array
const hexToRgb = (hex: hexProp) => {
  // if (!hex) return;
  let rgbValue: number[] = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m: string, r: string, g: string, b: string): string => '#' + r + r + g + g + b + b)
                                  .substring(1).match(/.{2}/g).map((x: string) => parseInt(x, 16))
  return rgbValue
}

//DKDK check number array and if empty
function isArrayOfNumbers(value: any) {
  return Array.isArray(value) && value.length && value.every(item => typeof item === "number");
}

//DKDK an example data: data are assumed to be number type only
// let boundValue = 2
let orientationValue = 'y'

//DKDK Real data comprised of numbers
const dataSet: VEuPathDBScatterPlotData = {
  data: [
    {
      series: {
        x: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,46,47],
        y: [0.58,0.54,0.43,0.86,1.19,1.47,0.98,1.36,0.58,0.82,0.77,1.22,2.21,0.46,1.55,1.38,0.98,1.4,1.29,1.3,1.56,1.73,1.48,1.38,1.1,1.14,0.84,1.12,1.07,1.1,0.73,0.86,1.16,1.02,0.77,1.04,0.57,0.08,0.2,0.4,0.23,0.13,-0.51,0,-0.35,0.21,-0.08],
      },
      // popupContent?: string;   //DKDK this prop is placed at each object, {x, y, popupContent}, but not tested
      interval: {
        x: [0,0.5949367,1.1898734,1.7848101,2.3797468,2.9746835,3.5696203,4.164557,4.7594937,5.3544304,5.9493671,6.5443038,7.1392405,7.7341772,8.3291139,8.9240506,9.5189873,10.1139241,10.7088608,11.3037975,11.8987342,12.4936709,13.0886076,13.6835443,14.278481,14.8734177,15.4683544,16.0632911,16.6582278,17.2531646,17.8481013,18.443038,19.0379747,19.6329114,20.2278481,20.8227848,21.4177215,22.0126582,22.6075949,23.2025316,23.7974684,24.3924051,24.9873418,25.5822785,26.1772152,26.7721519,27.3670886,27.9620253,28.556962,29.1518987,29.7468354,30.3417722,30.9367089,31.5316456,32.1265823,32.721519,33.3164557,33.9113924,34.5063291,35.1012658,35.6962025,36.2911392,36.8860759,37.4810127,38.0759494,38.6708861,39.2658228,39.8607595,40.4556962,41.0506329,41.6455696,42.2405063,42.835443,43.4303797,44.0253165,44.6202532,45.2151899,45.8101266,46.4050633,47],
        y: [0.5785742,0.62672442,0.67323618,0.71814504,0.76148657,0.80329633,0.84360987,0.88246277,0.91989058,0.95593748,0.9906337,1.02392407,1.05574679,1.08604006,1.11474209,1.1417911,1.16712527,1.19068283,1.21240197,1.23233582,1.25106432,1.26858248,1.28477776,1.29953759,1.31274943,1.32430073,1.33407893,1.34197147,1.34786582,1.35163861,1.35316678,1.35253669,1.34986715,1.34527693,1.33888484,1.33080965,1.32117016,1.31008516,1.29767344,1.28403089,1.26893232,1.25223203,1.23385632,1.2137315,1.19178388,1.16793976,1.14212545,1.11426725,1.08429147,1.05204324,1.01595307,0.97602739,0.93304169,0.88777145,0.84099215,0.79347928,0.74600833,0.69935477,0.6542941,0.61154602,0.56925692,0.52625652,0.48261979,0.43842174,0.39373736,0.34864164,0.30320957,0.25751615,0.21163636,0.16564487,0.11954102,0.07326909,0.02679829,-0.01990212,-0.0668629,-0.11411483,-0.16168865,-0.20961514,-0.25792504,-0.30664913],
        standardError: [0.17707248,0.16235568,0.14874309,0.13631127,0.12513697,0.11529107,0.10682941,0.09978058,0.09413275,0.08982227,0.08673276,0.08472218,0.08363165,0.08329509,0.08354947,0.08424304,0.08524034,0.08642434,0.08769652,0.08891579,0.08974583,0.09031039,0.09083636,0.09151829,0.09246373,0.09366216,0.09498058,0.09618371,0.09697145,0.09698261,0.0958602,0.09411663,0.09241673,0.09133085,0.09120903,0.0920902,0.09369136,0.09548291,0.09681067,0.09702663,0.09595857,0.0941586,0.09226917,0.0908584,0.09030512,0.09070753,0.09185823,0.0933012,0.09444301,0.09469448,0.09409325,0.09303255,0.09183424,0.09076517,0.089992,0.08955262,0.08935269,0.0891909,0.08880915,0.08797016,0.08692468,0.08591592,0.08501907,0.08432286,0.08393048,0.08395982,0.08454239,0.0858203,0.08794106,0.09105076,0.09529446,0.10077931,0.10755986,0.11564935,0.12502808,0.13565382,0.14747146,0.16042048,0.17443995,0.18947155],
        orientation: orientationValue,
      },
      color: '#00b0f6',       //DKDK use this as fitting line and scatter color
      label: 'Dataset 1',     //DKDK use this as "name" in plotly
    },
    // {
    //   series: {
    //     x: [1,3,5,7,9,11,13,15,17,19,2,4,6,8,10,12,14,16,18,20],
    //     y: [1.5,3.5,5.5,7.5,9.5,11.5,13.5,15.5,17.5,19.5,2.5,4.5,6.5,8.5,10.5,12.5,14.5,16.5,18.5,20.5],
    //   },
    //   color: '#000000',       //DKDK use this as point/marker color
    //   label: 'Dataset 2',     //DKDK use this as "name" in plotly
    // }
  ],
  // opacity: 0.2,
}

// //DKDK a sample data for testing Date format: ISO format only
// const dataSet: VEuPathDBScatterPlotData = {
//   data: [
//     {
//       series: {
//         x: ['2020-01-11T00:00:00Z', '2019-01-01T00:00:00Z', '2018-01-01T00:00:00Z', '2017-12-20T00:00:00Z', '2016-07-18T00:00:00Z', '2015-07-31T00:00:00Z','2014-01-11T00:00:00Z', '2013-01-01T00:00:00Z', '2012-05-01T00:00:00Z', '2012-01-05T00:00:00Z'],
//         y: [1,2,3,4,5,6,7,8,9,10],
//       },
//       // popupContent?: string;   //DKDK this prop is placed at each object, {x, y, popupContent}, but not tested
//       interval: {
//         x: ['2020-01-11T00:00:00Z', '2019-01-01T00:00:00Z', '2018-01-01T00:00:00Z', '2017-12-20T00:00:00Z', '2016-07-18T00:00:00Z', '2015-07-31T00:00:00Z','2014-01-11T00:00:00Z', '2013-01-01T00:00:00Z', '2012-05-01T00:00:00Z', '2012-01-05T00:00:00Z'],
//         y: [1.1,2.2,3.3,4.4,5.5,6.6,7.7,8.8,9.2,9.5],
//         standardError: [0.1,0.145,0.2,0.11,0.5,0.24,0.7,0.33,0.45,0.55],
//         orientation: orientationValue,
//       },
//       color: '#00b0f6',       //DKDK use this as fitting line and scatter color
//       label: 'Dataset 1',     //DKDK use this as "name" in plotly
//     },
//   ],
//   // opacity: 0.2,
// }

//DKDK set variables for x- and yaxis ranges
let xMin: number | Date = 0
let xMax: number = 0
let yMin: number | Date = 0
let yMax: number = 0

//DKDK set global Opacity value
let globalOpacity = (dataSet.opacity)? dataSet.opacity : 1

//DKDK set a default color
let defaultColor: string = '#00b0f6'

//DKDK making plotly input data
let dataSetProcess: Array<{}> = []
dataSet.data.forEach(function (el: any, index: number) {
  //DKDK initialize variables: setting with union type for future, but this causes typescript issue in the current version
  let xSeriesValue: number[] | Date[] = []
  let ySeriesValue: number[] | Date[] = []
  let xIntervalLineValue: number[] | Date[] = []
  let yIntervalLineValue: number[] | Date[] = []
  let standardErrorValue: number[] | Date[] = []    //DKDK this is for standardError
  let xIntervalBounds: number[] | Date[] = []
  let yIntervalBounds: number[] | Date[] = []
  let yUpperValues: number[] | Date[] = []
  let yLowerValues: number[] | Date[] = []
  //DKDK set rgbValue here per dataset with a default color
  let rgbValue: number[] = (el.color)? hexToRgb(el.color) : hexToRgb(defaultColor)
  let scatterPointColor: string = ''
  let fittingLineColor: string = ''
  let intervalColor: string = ''

  //DKDK series is for scatter plot
  if (el.series) {
    //DKDK check the number of x = number of y
    if (el.series.x.length !== el.series.y.length) {
      alert ('The number of X data is not equal to the number of Y data');
      throw new Error("The number of X data is not equal to the number of Y data");
    }

    //DKDK probably no need to have this for series data, though
    //1) combine the arrays:
    let combinedArray = [];
    for (let j = 0; j < el.series.x.length; j++) {
      combinedArray.push({'xValue': el.series.x[j], 'yValue': el.series.y[j]});
    }
    //2) sort:
    combinedArray.sort(function(a, b) {
      return ((a.xValue < b.xValue) ? -1 : ((a.xValue == b.xValue) ? 0 : 1));
    });
    //3) separate them back out:
    for (let k = 0; k < combinedArray.length; k++) {
      xSeriesValue[k] = combinedArray[k].xValue;
      ySeriesValue[k] = combinedArray[k].yValue;
    }

    //DKDK set variables for x-/y-axes ranges including x,y data points: considering Date data for X as well
    if (isArrayOfNumbers(xSeriesValue)) {
      xMin = (xMin < Math.min(...xSeriesValue))? xMin : Math.min(...xSeriesValue)
      xMax = (xMax > Math.max(...xSeriesValue))? xMax : Math.max(...xSeriesValue)
    } else if (index == 0) {
        xMin = new Date(Math.min(...xSeriesValue.map(date => new Date(date))))
        xMax = new Date(Math.max(...xSeriesValue.map(date => new Date(date))))
    } else {
      xMin = (xMin < Math.min(...xSeriesValue.map(date => new Date(date))))? xMin : new Date(Math.min(...xSeriesValue.map(date => new Date(date))))
      xMax = (xMax > Math.max(...xSeriesValue.map(date => new Date(date))))? xMax : new Date(Math.max(...xSeriesValue.map(date => new Date(date))))
    }
    yMin = (yMin < Math.min(...ySeriesValue))? yMin : Math.min(...ySeriesValue)
    yMax = (yMax > Math.max(...ySeriesValue))? yMax : Math.max(...ySeriesValue)

    //DKDK use global opacity for coloring
    scatterPointColor = 'rgba(' + rgbValue[0] + ',' + rgbValue[1] + ',' + rgbValue[2] + ',' + globalOpacity + ')'   //DKDK set alpha/opacity as 0.2 for CI

    //DKDK add scatter data
    dataSetProcess.push({
      x: xSeriesValue,
      y: ySeriesValue,
      name: el.label,
      mode: 'markers',
      // mode: 'lines+markers',
      type: 'scattergl',
      marker: { color: scatterPointColor, size: 12 },
    })
  }
  //DKDK check if interval prop exists
  if (el.interval) {
    //DKDK check the number of x = number of y or standardError
    if (el.interval.x.length !== el.interval.y.length || el.interval.x.length !== el.interval.standardError.length) {
      alert ('The number of X data is not equal to the number of Y data or standardError data');
      throw new Error("The number of X data is not equal to the number of Y data or standardError data");
    }
    //DKDK sorting function
    //1) combine the arrays: including standardError
    let combinedArrayInterval = [];
    for (let j = 0; j < el.interval.x.length; j++) {
      combinedArrayInterval.push({'xValue': el.interval.x[j], 'yValue': el.interval.y[j], 'zValue': el.interval.standardError[j]});
    }
    //2) sort:
    combinedArrayInterval.sort(function(a, b) {
      return ((a.xValue < b.xValue) ? -1 : ((a.xValue == b.xValue) ? 0 : 1));
    });
    //3) separate them back out:
    for (let k = 0; k < combinedArrayInterval.length; k++) {
      xIntervalLineValue[k] = combinedArrayInterval[k].xValue;
      yIntervalLineValue[k] = combinedArrayInterval[k].yValue;
      standardErrorValue[k] = combinedArrayInterval[k].zValue;
    }

    //DKDK set variables for x-/y-axes ranges including fitting line
    if (isArrayOfNumbers(xIntervalLineValue)) {
      xMin = (xMin < Math.min(...xIntervalLineValue))? xMin : Math.min(...xIntervalLineValue)
      xMax = (xMax > Math.max(...xIntervalLineValue))? xMax : Math.max(...xIntervalLineValue)
    } else {
      xMin = (xMin < Math.min(...xIntervalLineValue.map(date => new Date(date))))? xMin : new Date(Math.min(...xIntervalLineValue.map(date => new Date(date))))
      xMax = (xMax > Math.max(...xIntervalLineValue.map(date => new Date(date))))? xMax : new Date(Math.max(...xIntervalLineValue.map(date => new Date(date))))
    }
    yMin = (yMin < Math.min(...yIntervalLineValue))? yMin : Math.min(...yIntervalLineValue)
    yMax = (yMax > Math.max(...yIntervalLineValue))? yMax : Math.max(...yIntervalLineValue)

    //DKDK use global opacity for coloring
    fittingLineColor = 'rgba(' + rgbValue[0] + ',' + rgbValue[1] + ',' + rgbValue[2] + ',' + globalOpacity + ')'

    //DKDK store data for fitting line
    dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        name: el.label + ' fitting',
        // mode: 'lines+markers',
        mode: 'lines',                  //DKDK no data point is displayed: only line
        // type: 'line',
        // line: {color: el.color, shape: 'spline',  width: 5 },
        line: {color: fittingLineColor, shape: 'spline',  width: 5 },
    })
    //DKDK make Confidence Interval (CI) or Bounds (filled area)
    xIntervalBounds = xIntervalLineValue
    xIntervalBounds = xIntervalBounds.concat(xIntervalLineValue.map((element: any) => element).reverse())

    //DKDK finding upper and lower bound values.
    if (el.interval.orientation == 'x') {
      yUpperValues = xIntervalLineValue.map((num: number, idx: number) => num + 2*standardErrorValue[idx])
      yLowerValues = xIntervalLineValue.map((num: number, idx: number) => num - 2*standardErrorValue[idx])
    } else if (el.interval.orientation == 'y') {
      yUpperValues = yIntervalLineValue.map((num: number, idx: number) => num + 2*standardErrorValue[idx])
      yLowerValues = yIntervalLineValue.map((num: number, idx: number) => num - 2*standardErrorValue[idx])
    }

    //DKDK make upper and lower bounds plotly format
    yIntervalBounds = yUpperValues
    yIntervalBounds = yIntervalBounds.concat(yLowerValues.map((element: any) => element).reverse())

    //DKDK set alpha/opacity as 0.2 for CI
    intervalColor = 'rgba(' + rgbValue[0] + ',' + rgbValue[1] + ',' + rgbValue[2] + ',0.2)'

    //DKDK set variables for x-/y-axes ranges including CI/bounds: no need for x data as it was compared before
    yMin = (yMin < Math.min(...yLowerValues))? yMin : Math.min(...yLowerValues)
    yMax = (yMax > Math.max(...yUpperValues))? yMax : Math.max(...yUpperValues)

    //DKDK store data for CI/bounds
    dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        name: "Confidence interval",
        fill: "tozerox",
        fillcolor: intervalColor,
        type: "line",
        line: {color: "transparent", shape: 'spline'},    //DKDK here, line means upper and lower bounds
    })
  }

  //DKDK determine y-axis range: x-axis should be in the range of [xMin,xMax] due to CI plot
  yMin = (yMin < 0)? Math.floor(yMin) : Math.ceil(yMin)
  yMax = (yMax < 0)? Math.floor(yMax) : Math.ceil(yMax)

})

console.log('xyMinMax = ',xMin,xMax,yMin,yMax)

/**
 * DKDK width and height of the plot are manually set at ScatterAndLinePlotCIReal (layout)
 * Opacity control (slider) is manually set at ScatterAndLinePlotCIReal (layout)
 */
export const RealDataDate = () => <ScatterAndLinePlotCIReal
  onPlotUpdate={action('state updated')}
  data={[...dataSetProcess]}
  xLabel="Hours post infection"
  yLabel="Expression Values (log2 ratio)"
  plotTitle="Expression Values - PF3D7_0107900 - Total mRNA Abundance"
  xRange={[xMin, xMax]}
  yRange={[yMin, yMax]}
/>

