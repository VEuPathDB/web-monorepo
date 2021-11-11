import React from 'react';
import { FacetedData } from '../types/plots';
import { PlotProps } from './PlotlyPlot';

export interface FacetedPlotProps<D, P extends PlotProps<D>> {
  data?: FacetedData<D>;
  component: React.ComponentType<P>;
  props: P;
  // custom legend prop
  checkedLegendItems?: string[];
}

export default function FacetedPlot<D, P extends PlotProps<D>>(
  props: FacetedPlotProps<D, P>
) {
  const {
    data,
    component: Component,
    props: componentProps,
    checkedLegendItems: checkedLegendItems,
  } = props;
  return (
    <>
      <h2>{componentProps.title}</h2>
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          width: '100%',
          overflow: 'auto',
        }}
      >
        {data?.facets.map(({ data, label }, index) => (
          <Component
            {...componentProps}
            key={index}
            data={data}
            title={label}
            displayLegend={false}
            interactive={false}
            // pass checkedLegendItems to PlotlyPlot
            checkedLegendItems={checkedLegendItems}
          />
        ))}
      </div>
    </>
  );
}
