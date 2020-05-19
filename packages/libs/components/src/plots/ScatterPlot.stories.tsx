import React from 'react';
import { action } from '@storybook/addon-actions';
import ScatterPlot from './ScatterPlot';

export default {
  title: 'ScatterPlot',
  component: ScatterPlot,
};

export const Basic = () => <ScatterPlot
  onUpdate={action('state updated')}
  xData={[1,2,3,4,5,6]}
  yData={[6,5,4,3,2,1]}
  xLabel="foo"
  yLabel="bar"
  height={300}
  width={300}
/>
