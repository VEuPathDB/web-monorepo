import React from 'react';
import { action } from '@storybook/addon-actions';
import Pie from './Pie';

export default {
  title: 'Pie',
  component: Pie,
};

export const Basic = () => <Pie
  //onPlotUpdate={action('state updated')}
  data={
    [{
      value: 10,
      label: 'Foo',
    },
    {
      value: 2,
      label: 'Bar',
    },
    {
      value: 30,
      label: 'Baz',
    }]
  }
/>
