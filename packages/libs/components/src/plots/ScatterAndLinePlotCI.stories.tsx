import React from 'react';
import { action } from '@storybook/addon-actions';
import ScatterAndLinePlotCI from './ScatterAndLinePlotCI';

export default {
  title: 'ScatterAndLinePlot CI',
  component: ScatterAndLinePlotCI,
};

/**
 * DKDK As of now, about ten type errors (excluding manual data input) are shown but they can be categorized as two kinds of errors in the following:
 * a) union type (e.g., x & y with number or Date) and its mathematical operation with single type
 *    perhaps type guard is needed?
 * b) js built-in methods/functions like replace(), concat(), map()
 *
 * # Possible to-do-list, not necessarily a must-have item
 * 1) perhaps it is better to set a type for union types (e.g., type numberDate = number | Date) but it is not used here
 * 2) currently, Date type data is not considered: only number type data is implemented
 * 3) "opacity" prop is not considered yet: though, this can be done by configuring "color" as rgba() where alpha is almost identical to opacity
 *    However, with the presence of Opacity slider and the nature of opacity props (global setting, not for individual data), it is not clear if this prop will be used
 * 4) "popupContent" prop is not considered
 * 5) what if "color" props is not provided? Currently it is assumed to be given
 * 6) finding x & y range programatically? (especially for x-axis range due to the nature of confidence interval (filled area))
 *
 */

//DKDK set data array types for VEuPathDB scatter plot
// https://redmine.apidb.org/issues/41310
interface VEuPathDBScatterPlotData {
  data : Array<{
    series: Array<{
      x: number | Date;
      y: number | Date;
      popupContent?: string;
    }>;
    interval?: Array<{
      x: number | Date;
      y: number | Date;
      orientation: string;
      standardError: number;
    }>;
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

//DKDK an example data: data are assumed to be number type only
let errorValue = 2
let orientationValue = 'y'
const dataSet: VEuPathDBScatterPlotData = {
  data: [
    {
      series: [{x:1.2, y:3.5}, {x:2.4,y:4.5}, {x:3.2,y:2.5}, {x:4.4,y:8.5}, {x:5.7,y:7.5}, {x:6.9,y:3.5}, {x:7.1,y:6.5}, {x:8.5,y:3.5}, {x:9.1,y:4.5}, {x:10,y:7}],
      // popupContent?: string;   //DKDK this prop is placed at each object, {x, y, popupContent}, but not tested
      interval: [
        {x:1, y:5.0, orientation: orientationValue, standardError: errorValue},
        {x:2, y:2.5, orientation: orientationValue, standardError: errorValue},
        {x:3, y:5.0, orientation: orientationValue, standardError: errorValue},
        {x:4, y:7.5, orientation: orientationValue, standardError: errorValue},
        {x:5, y:5.0, orientation: orientationValue, standardError: errorValue},
        {x:6, y:2.5, orientation: orientationValue, standardError: errorValue},
        {x:7, y:7.5, orientation: orientationValue, standardError: errorValue},
        {x:8, y:4.5, orientation: orientationValue, standardError: errorValue},
        {x:9, y:5.5, orientation: orientationValue, standardError: errorValue},
        {x:10,y:5.0, orientation: orientationValue, standardError: errorValue}
      ],
      color: '#00b0f6',       //DKDK use this as fitting line and scatter color
      label: 'Dataset 1',     //DKDK use this as "name" in plotly
    },
    {
      series: [{x:1.5, y:5}, {x:2,y:2.5}, {x:2.5,y:5}, {x:3,y:7.5}, {x:3.5,y:5}, {x:4,y:2.5}, {x:5,y:7.5}, {x:5.5,y:4.5}, {x:6,y:9.5}, {x:7,y:5}, {x:8,y:4.5}, {x:8.5,y:9.5}, {x:9,y:5}],
      color: '#000000',       //DKDK use this as point/marker color
      label: 'Dataset 2',     //DKDK use this as "name" in plotly
    }],
    // opacity?: number;      //DKDK not clear if this is required, especially with Opacity slider
}

//DKDK making plotly data: assumption - the X-data are comprised of the ascending order
//Thus, if not, a sorting will be required
let dataSetProcess: Array<{}> = []
dataSet.data.forEach(function (el: any) {
  //DKDK initialize variables: setting with union type for future but this causes typescript issue in the current version
  let xSeriesValue: number[] | Date[] = []
  let ySeriesValue: number[] | Date[] = []
  let xIntervalLineValue: number[] | Date[] = []
  let yIntervalLineValue: number[] | Date[] = []
  let xIntervalBounds: number[] | Date[] = []
  let yIntervalBounds: number[] | Date[] = []
  let yUpperValues: number[] | Date[] = []
  // let yUpperValues: number[] = []
  let yLowerValues: number[] | Date[] = []
  let rgbValue: number[] = []
  let rgbText: string = ''                            //DKDK not used yet
  let intervalColor: string = ''
  //DKDK series is for scatter plot
  if (el.series) {
    xSeriesValue = el.series.map(function (element: any) { return element.x; })
    ySeriesValue = el.series.map(function (element: any) { return element.y; })
    // rgbValue = hexToRgb(el.color)
    // rgbText = 'rgb(' + rgbValue[0] + ',' + rgbValue[1] + ',' + rgbValue[2] + ')'
    dataSetProcess.push({
      x: xSeriesValue,
      y: ySeriesValue,
      name: el.label,
      mode: 'markers',
      // mode: 'lines+markers',
      type: 'scattergl',
      marker: { color: el.color, size: 12 },
    })
  }
  //DKDK if interval prop exists
  if (el.interval) {
    //DKDK draw curve fitting line based on x & y
    xIntervalLineValue = el.interval.map(function (element: any) { return element.x; })
    yIntervalLineValue = el.interval.map(function (element: any) { return element.y; })
    dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        name: el.label + ' fitting',
        // mode: 'lines+markers',
        mode: 'lines',
        // type: 'line',
        line: {color: el.color, shape: 'spline',  width: 5 },
    })

    //DKDK make Confidence Interval (CI) (filled area)
    xIntervalBounds = el.interval.map(function (element: any) { return element.x; })
    xIntervalBounds= xIntervalBounds.concat(el.interval.map(function (element: any) { return element.x; }).reverse())
    //DKDK finding upper and lower bound values. For now, let's assume that both x and y values are numbers
    el.interval.forEach(function (param: {x: number | Date, y: number | Date, orientation: string, standardError: number | Date}) {
    // console.log('x,y,ori,err = ',para.x,para.y,para.orientation,para.standardError)
      if (param.orientation == 'x') {
        // yUpperValues.push(param.x + param.standardError)
        yUpperValues.push(param.x + param.standardError)
        yLowerValues.push(param.x - param.standardError)
      } else if (param.orientation == 'y') {
        yUpperValues.push(param.y + param.standardError)
        yLowerValues.push(param.y - param.standardError)
      }
    })
    //DKDK make upper and lower bounds for plotly format
    yIntervalBounds = yUpperValues
    yIntervalBounds = yIntervalBounds.concat(yLowerValues.map(function (element: any) { return element; }).reverse())
    //DKDK set CI color with alpha (like opacity)
    rgbValue = hexToRgb(el.color)
    intervalColor = 'rgba(' + rgbValue[0] + ',' + rgbValue[1] + ',' + rgbValue[2] + ',0.2)'   //DKDK set alpha/opacity as 0.2 for CI
    //DKDK push CI data
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
})

/**
 * DKDK ManualInputData() is an example to test whether a plot is made correctly
 * Thus, type errors in this function can be ignored as this would not be used in the end
 */
export const ManualInputData = () => <ScatterAndLinePlotCI
onPlotUpdate={action('state updated')}
data={[{
  x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  y: [5, 2.5, 5, 7.5, 5, 2.5, 7.5, 4.5, 5.5, 5],
  line: {color: "rgb(0,176,246)", shape: 'spline',  width: 5 },
  // line: {shape: 'spline'},
  mode: "lines",
  // mode: 'lines+markers',
  name: "Curve fitting",
  // type: "line"
},{
  x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  y: [6.5, 3, 6.5, 9, 6, 5, 8, 5, 7, 5.5, 4, 5, 4, 6, 1, 4, 5, 4.4, 1, 4],
  fill: 'tozerox',
  fillcolor: 'rgba(0,176,246,0.2)',
  // fillcolor: '#00b0f6',
  line: {color: 'transparent', shape: 'spline'},
  name: "Confidence interval",
  // showlegend: false,
  // mode: "lines",
  type: "scatter"
},{
  x: [1.5, 2, 2.5, 3, 3.5, 4, 5, 5.5, 6, 7, 8, 8.5, 9],
  y: [1, 5, 5, 7, 3, 2, 7, 1, 5, 5, 7, 3, 2],
  mode: 'markers',
  type: 'scattergl',
  name: 'Markers',
  marker: {
    color: '#000000',
    size: 12
  },
}]}
xLabel="foo"
yLabel="bar"
plotTitle="Example: Scatter plot with confidence interval"
//DKDK involving CI, x & y range may need to be set. For now it is manually set
//in most cases, autorange would work, except xRange where CI tends to extend its plot to 0,0
xRange={[1,10]}
yRange={[0,10]}
/>

export const PreprocessedData = () => <ScatterAndLinePlotCI
onPlotUpdate={action('state updated')}
data={[...dataSetProcess]}
xLabel="foo"
yLabel="bar"
plotTitle="Example: Scatter plot with confidence interval"
//DKDK involving CI, x & y range may need to be set. For now it is manually set
//in most cases, autorange would work, except xRange where CI tends to extend its plot to 0,0
xRange={[1,10]}
yRange={[0,10]}
/>

