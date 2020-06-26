import React from 'react';
import { action } from '@storybook/addon-actions';
import Pie from './Pie';

export default {
  title: 'Pie',
  component: Pie,
};

export const Basic = () => <Pie
  onPlotUpdate={action('state updated')}
  data={[{
    labels: [ 'Foo', 'Bar', 'Baz' ],
    values: [ 10, 2, 30 ]
  }]}
/>
