import React from 'react';
import Pie from './Pie';

export default {
  title: 'Pie',
  component: Pie,
};

export const Basic = () => <Pie
  data={[{
    labels: [ 'Foo', 'Bar', 'Baz' ],
    values: [ 10, 2, 30 ]
  }]}
/>
