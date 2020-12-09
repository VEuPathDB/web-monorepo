import React from 'react';
import PiePlot from '../plots/PiePlot';

export default {
  title: 'PiePlot',
  component: PiePlot,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/41799'
  }
};

let data = [
  {
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
  }
];

let coloredData = [
  {
    value: 10,
    label: 'Green',
    color: 'green',
  },
  {
    value: 2,
    label: 'Red',
    color: 'red',
  },
  {
    value: 30,
    label: 'Default',
  }
];

export const BasicPie = () => <PiePlot
  //onPlotUpdate={action('state updated')}
  data={data}
  height={400}
  width={400}
/>

export const PieCustomColors = () => <PiePlot
  //onPlotUpdate={action('state updated')}
  data={coloredData}
  height={400}
  width={400}
/>

export const BasicDonut = () => <PiePlot
  //onPlotUpdate={action('state updated')}
  data={data}
  interior={{
    heightPercentage: 0.4,
  }}
  height={400}
  width={400}
/>

export const DonutText = () => <PiePlot
  //onPlotUpdate={action('state updated')}
  data={data}
  interior={{
    heightPercentage: 0.4,
    text: 'Pie Hole',
    textColor: 'purple',
    fontSize: 20,
  }}
  height={400}
  width={400}
/>

export const DonutCreamyFilling = () => <PiePlot
  //onPlotUpdate={action('state updated')}
  data={data}
  interior={{
    heightPercentage: 0.4,
    backgroundColor: 'yellow',
  }}
  height={400}
  width={400}
/>

export const EverythingBagel = () => <PiePlot
  //onPlotUpdate={action('state updated')}
  data={coloredData}
  interior={{
    heightPercentage: 0.4,
    text: 'Pie Hole',
    textColor: 'purple',
    fontSize: 20,
    backgroundColor: 'yellow',
  }}
  height={400}
  width={400}
/>
