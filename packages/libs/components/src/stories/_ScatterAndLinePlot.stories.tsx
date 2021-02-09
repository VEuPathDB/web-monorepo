import React from 'react';
import ScatterAndLinePlot from '../plots/ScatterAndLinePlot';

export default {
  title: 'ScatterAndLinePlot',
  component: ScatterAndLinePlot,
};

export const Basic = () => (
  <ScatterAndLinePlot
    data={[
      {
        x: ['bf-ld', 'bf-hd'],
        y: [-1.06, -0.65],
        name: 'Variable A',
        mode: 'markers',
        fill: 'none',
      },
      {
        x: ['0.5hr', '1hr', '12hr', '24hr', '48hr', '72hr'],
        y: [-1.09, -0.33, -0.52, -0.24, -0.36, -0.08],
        name: 'Variable B',
        mode: 'lines+markers',
        fill: 'none',
      },
    ]}
    xLabel="foo"
    yLabel="bar"
    plotTitle="TriTrypDB: exprn_val - Tb927.11.3120"
  />
);

export const BasicFilled = () => (
  <ScatterAndLinePlot
    data={[
      {
        x: ['bf-ld', 'bf-hd'],
        y: [-1.06, -0.65],
        name: 'Variable A',
        mode: 'markers',
        fill: 'none',
      },
      {
        x: ['0.5hr', '1hr', '12hr', '24hr', '48hr', '72hr'],
        y: [-1.09, -0.33, -0.52, -0.24, -0.36, -0.08],
        name: 'Variable B',
        mode: 'lines+markers',
        fill: 'tozeroy',
      },
    ]}
    xLabel="foo"
    yLabel="bar"
    plotTitle="TriTrypDB: exprn_val - Tb927.11.3120"
  />
);
