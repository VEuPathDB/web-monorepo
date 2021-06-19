import React from 'react';
import XYPlot, { XYPlotProps, EmptyXYPlotData } from '../../plots/XYPlot';
import { dataSetProcess, xAxisRange, yAxisRange } from './XYPlot.storyData';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
  title: 'Plots/XYPlot',
  component: XYPlot,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/41310',
  },
} as Meta;

/**
 *  width and height of the plot are manually set at ScatterAndLinePlotCIReal (layout)
 * Opacity control (slider) is manually set at ScatterAndLinePlotCIReal (layout)
 */
const Template: Story<XYPlotProps> = (args) => {
  return <XYPlot {...args} />;
};

const disableDataControl = {
  data: { control: { disable: true } },
};

export const RealData = Template.bind({});
RealData.args = {
  data: dataSetProcess,
  title: 'Expression Values - PF3D7_0107900 - Total mRNA Abundance',
  independentAxisLabel: 'Hours post infection',
  dependentAxisLabel: 'Expression Values (log2 ratio)',
  independentAxisRange: xAxisRange,
  dependentAxisRange: yAxisRange,
  interactive: true,
  displayLegend: true,
  displayLibraryControls: false,
  legendTitle: 'Legend title example',
  containerStyles: {
    height: '500px',
  },
};
// Don't show "data" in storybook controls because it's impractical to edit it
RealData.argTypes = disableDataControl;

export const EmptyData = Template.bind({});
EmptyData.args = {
  data: EmptyXYPlotData,
};
EmptyData.argTypes = disableDataControl;

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  data: EmptyXYPlotData,
  showSpinner: true,
};
EmptyDataLoading.argTypes = disableDataControl;

export const NumberVsDate = Template.bind({});
NumberVsDate.args = {
  data: {
    series: [
      {
        x: [
          '2013-12-20',
          '2013-12-25',
          '2014-04-11',
          '2014-04-12',
          '2014-05-01',
          '2014-07-18',
          '2015-01-11',
          '2015-07-31',
          '2015-09-21',
          '2015-11-11',
        ],
        y: [38, 56, 85, 10, 20, 69, 29, 57, 58, 100],
        name: 'Sales',
        mode: 'lines+markers',
      },
      {
        x: [
          '2013-12-20',
          '2013-12-25',
          '2014-04-11',
          '2014-04-12',
          '2014-05-01',
          '2014-07-18',
          '2015-01-11',
          '2015-07-31',
          '2015-09-21',
          '2015-11-11',
        ],
        y: [39, 54, 84, 89, 25, 66, 72, 38, 93, 11],
        name: 'Ad spend',
        mode: 'lines+markers',
      },
    ],
    independentValueType: 'date',
    dependentValueType: 'number',
  },
};
