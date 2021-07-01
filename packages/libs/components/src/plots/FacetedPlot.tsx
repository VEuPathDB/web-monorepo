import React from 'react';
import { FacetedData } from '../types/plots';
import { PlotProps } from './PlotlyPlot';

export interface FacetedPlotProps<D, P extends PlotProps<D>> {
  data: FacetedData<D>;
  component: React.ElementType<P>; // ensures that the component type and props are compatible
  props: P;
}

export default function FacetedPlot<D, P extends PlotProps<D>>(
  props: FacetedPlotProps<D, P>
) {
  const { data, component, props: componentProps } = props;

  const Component = component as React.ElementType; // casting seems to be needed if using component: React.ElementType<P>; above
  return (
    <div>
      <h2>{componentProps.title}</h2>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {data.map(({ facetData, facetLabel }, index) => (
          <Component
            {...componentProps}
            key={index}
            data={facetData}
            title={facetLabel}
            containerStyles={{
              width: '300px',
              height: '300px',
              border: '3px dashed gray',
            }}
            displayLegend={false}
            interactive={true}
          />
        ))}
      </div>
    </div>
  );
}
