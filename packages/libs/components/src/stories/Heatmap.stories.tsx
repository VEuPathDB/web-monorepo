import React from 'react';
import Heatmap from '../plots/Heatmap';

export default {
  title: 'Heatmap',
  component: Heatmap,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/42052',
  }
};

interface dataProps {
  data: number[][];
  xLabels?: number[] | string[];
  yLabels?: number[] | string[];
  showValue?: boolean;
}

//DKDK arbitrary datasets
const dataBasic: dataProps = {
    data: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
    showValue: false,
}

const dataCategorical: dataProps = {
    data: [[1, 10, 30, 50, 1], [20, 1, 60, 80, 30], [30, 60, 1, -10, 20]],
    xLabels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    yLabels: ['Morning', 'Afternoon', 'Evening'],
    showValue: true,
}

/*DKDK making plotly input data
  perhaps adding smoothing? zsmooth = one of ( "fast" | "best" | false )
  didn't make this as function as not much preprocessing is required
*/
let zsmoothBasic: 'fast' | 'best' | false = false
let zsmoothCategorical: 'fast' | 'best' | false = 'best'

let dataSetProcessBasic: Array<{x: number[] | string[], y: number[] | string[], z: number[][], type: string, zsmooth: 'fast' | 'best' | false}> = []
dataSetProcessBasic.push({
  z: dataBasic.data,
  x: (dataBasic.xLabels) ? dataBasic.xLabels : [],
  y: (dataBasic.yLabels) ? dataBasic.yLabels : [],
  type: 'heatmap',
  zsmooth: (zsmoothBasic) ? zsmoothBasic : false,
})

//DKDK making plotly input data: categorical with value texts
let dataSetProcessCategorical: Array<{x: number[] | string[], y: number[] | string[], z: number[][], type: string, zsmooth: 'fast' | 'best' | false}> = []
dataSetProcessCategorical.push({
  z: dataCategorical.data,
  x: (dataCategorical.xLabels) ? dataCategorical.xLabels : [],
  y: (dataCategorical.yLabels) ? dataCategorical.yLabels : [],
  type: 'heatmap',
  zsmooth: (zsmoothBasic) ? zsmoothBasic : false,
})

//DKDK making plotly input data: categorical with value texts and smoothing
let dataSetProcessCategoricalSmoothing: Array<{x: number[] | string[], y: number[] | string[], z: number[][], type: string, zsmooth: 'fast' | 'best' | false}> = []
dataSetProcessCategoricalSmoothing.push({
  z: dataCategorical.data,
  x: (dataCategorical.xLabels) ? dataCategorical.xLabels : [],
  y: (dataCategorical.yLabels) ? dataCategorical.yLabels : [],
  type: 'heatmap',
  zsmooth: (zsmoothCategorical) ? zsmoothCategorical : false,
})

//DKDK set width & height
let plotWidth = 1000
let plotHeight = 600

export const Basic = () => <Heatmap
  data={dataSetProcessBasic}
  showValue={dataBasic.showValue}
  xLabel="foo"
  yLabel="bar"
  plotTitle="Basic data: showValue = false"
  width={plotWidth}
  height={plotHeight}
/>


export const Categorical = () => <Heatmap
  data={dataSetProcessCategorical}
  showValue={dataCategorical.showValue}
  xLabel="foo"
  yLabel="bar"
  plotTitle="Categorical data: showValue = true"
  width={plotWidth}
  height={plotHeight}
/>

export const CategoricalSmoothing = () => <Heatmap
  data={dataSetProcessCategoricalSmoothing}
  showValue={dataCategorical.showValue}
  xLabel="foo"
  yLabel="bar"
  plotTitle="Categorical data: showValue = true, zsmooth = best"
  width={plotWidth}
  height={plotHeight}
/>
