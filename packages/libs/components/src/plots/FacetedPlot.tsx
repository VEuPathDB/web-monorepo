import React from 'react';
import { isFaceted } from '../types/guards';
import { FacetedData } from '../types/plots';
import { PlotProps } from './PlotlyPlot';

export interface FacetedPlotProps<D, P extends PlotProps<D>> {
  data?: FacetedData<D>;
  component: React.ElementType<P>;
  props: P;
}

export default function FacetedPlot<D, P extends PlotProps<D>>(
  props: FacetedPlotProps<D, P>
) {
  const { data, component, props: componentProps } = props;

  const Component = component as React.ElementType; // casting seems to be needed if using component: React.ElementType<P>; above

  // return a regular plot component if the data isn't faceted.
  if (!isFaceted(data)) {
    throw new Error('Unfaceted data provided to FacetedPlot');
  } else {
    return (
      <div>
        <h2>{componentProps.title}</h2>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {data?.facets.map(({ data, label }, index) => (
            <Component
              {...componentProps}
              key={index}
              data={data}
              title={label}
              containerStyles={{
                width: '300px',
                height: '300px',
                border: '3px dashed gray',
              }}
              displayLegend={false}
              interactive={false}
            />
          ))}
        </div>
      </div>
    );
  }
}
