import React from 'react';
import XYPlot, { ScatterplotProps } from '../../plots/XYPlot';
import { EmptyScatterplotData } from '../../types/plots/scatterplot';
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
const Template: Story<ScatterplotProps> = (args) => {
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
  data: EmptyScatterplotData,
};
EmptyData.argTypes = disableDataControl;

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  data: EmptyScatterplotData,
  showSpinner: true,
};
EmptyDataLoading.argTypes = disableDataControl;
