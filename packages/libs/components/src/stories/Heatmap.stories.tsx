import React from 'react';
import Heatmap, { Props } from '../plots/Heatmap';
import { Meta, Story } from '@storybook/react';

export default {
  title: 'Heatmap',
  component: Heatmap,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/42052',
  },
};

//DKDK IMO it is better to have zsmooth option here
interface dataProps {
  data: number[][];
  xLabels?: number[] | string[];
  yLabels?: number[] | string[];
  showValue?: boolean;
  zsmooth?: 'fast' | 'best' | false;
}

//DKDK set zsmooth value
let zsmoothBasic: 'fast' | 'best' | false = false;
let zsmoothCategorical: 'fast' | 'best' | false = 'best';

//DKDK arbitrary datasets
const dataBasic: dataProps = {
  data: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  showValue: false,
  zsmooth: zsmoothBasic,
};

const dataCategorical: dataProps = {
  data: [
    [1, 10, 30, 50, 1],
    [20, 1, 60, 80, 30],
    [30, 60, 1, -10, 20],
  ],
  xLabels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  yLabels: ['Morning', 'Afternoon', 'Evening'],
  showValue: true,
  zsmooth: zsmoothCategorical,
};

/*DKDK making plotly input data
  perhaps adding smoothing? zsmooth = one of ( "fast" | "best" | false )
  didn't make this as function as not much preprocessing is required
*/

let dataSetProcessBasic: Array<{
  x: number[] | string[];
  y: number[] | string[];
  z: number[][];
}> = [];
dataSetProcessBasic.push({
  z: dataBasic.data,
  x: dataBasic.xLabels ? dataBasic.xLabels : [],
  y: dataBasic.yLabels ? dataBasic.yLabels : [],
});

//DKDK making plotly input data: categorical with value texts
let dataSetProcessCategorical: Array<{
  x: number[] | string[];
  y: number[] | string[];
  z: number[][];
}> = [];
dataSetProcessCategorical.push({
  z: dataCategorical.data,
  x: dataCategorical.xLabels ? dataCategorical.xLabels : [],
  y: dataCategorical.yLabels ? dataCategorical.yLabels : [],
});

//DKDK making plotly input data: categorical with value texts and smoothing
let dataSetProcessCategoricalSmoothing: Array<{
  x: number[] | string[];
  y: number[] | string[];
  z: number[][];
}> = [];
dataSetProcessCategoricalSmoothing.push({
  z: dataCategorical.data,
  x: dataCategorical.xLabels ? dataCategorical.xLabels : [],
  y: dataCategorical.yLabels ? dataCategorical.yLabels : [],
});

//DKDK set width & height
let plotWidth = 1000;
let plotHeight = 600;

export const Basic = () => (
  <Heatmap
    data={dataSetProcessBasic}
    showValue={dataBasic.showValue}
    // zsmooth={dataBasic.zsmooth}             //DKDK get this value from data: if not set, it will be false
    xLabel="foo"
    yLabel="bar"
    plotTitle="Basic data: showValue = false"
    width={plotWidth}
    height={plotHeight}
  />
);

export const Categorical = () => (
  <Heatmap
    data={dataSetProcessCategorical}
    showValue={dataCategorical.showValue}
    // zsmooth={dataBasic.zsmooth}             //DKDK get this value from data: if not set, it will be false
    xLabel="foo"
    yLabel="bar"
    plotTitle="Categorical data: showValue = true"
    width={plotWidth}
    height={plotHeight}
  />
);

export const CategoricalSmoothing = () => (
  <Heatmap
    data={dataSetProcessCategoricalSmoothing}
    showValue={dataCategorical.showValue}
    zsmooth={dataCategorical.zsmooth} //DKDK get this value from data
    xLabel="foo"
    yLabel="bar"
    plotTitle="Categorical data: showValue = true, zsmooth = best"
    width={plotWidth}
    height={plotHeight}
  />
);

//DKDK adding storybook control
const Template = (args: Props) => <Heatmap {...args} />;
export const CategoricalWithControl: Story<Props> = Template.bind({});
//DKDK set default values for args that use default storybook control
CategoricalWithControl.args = {
  data: dataSetProcessCategorical,
  showValue: dataBasic.showValue,
  zsmooth: dataBasic.zsmooth, //DKDK get this value from data
  xLabel: 'foo',
  yLabel: 'bar',
  plotTitle: 'Categorical data with storybook control',
  width: plotWidth,
  height: plotHeight,
};
//DKDK set specific storybook control: here, dropdown for zsmooth props
CategoricalWithControl.argTypes = {
  zsmooth: {
    control: {
      type: 'select',
      options: ['false', 'fast', 'best'],
    },
    //DKDK set default value here: parallel to control parameter
    //DKDK there is a known bug not showing defaultValue at dropdown: recently fixed but not sure when it will be updated
    defaultValue: false,
  },
};
