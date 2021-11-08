import React, { Ref, forwardRef, useImperativeHandle, useRef } from 'react';

import { memoize } from 'lodash';

import { isFaceted } from '../types/guards';
import { FacetedData } from '../types/plots';
import { ComponentWithPlotRef, PlotProps, PlotRef } from './PlotlyPlot';

export interface FacetedPlotProps<D, P extends PlotProps<D>> {
  data?: FacetedData<D>;
  component: ComponentWithPlotRef<P>;
  props: P;
}

export type FacetedPlotRef = PlotRef[];

function renderFacetedPlot<D, P extends PlotProps<D>>(
  props: FacetedPlotProps<D, P>,
  ref: Ref<FacetedPlotRef>
) {
  const { data, component: Component, props: componentProps } = props;
  const plotRefs = useRef<FacetedPlotRef>([]);

  useImperativeHandle<FacetedPlotRef, FacetedPlotRef>(
    ref,
    () => {
      const plotRefsLength = data?.facets.length ?? 0;

      plotRefs.current = plotRefs.current.slice(0, plotRefsLength);

      return plotRefs.current;
    },
    [data?.facets]
  );

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
              ref={(plotRef) => {
                if (plotRef == null) {
                  delete plotRefs.current[index];
                } else {
                  plotRefs.current[index] = plotRef;
                }
              }}
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

const makeFacetedPlotComponent = memoize(function <D, P extends PlotProps<D>>(
  UnfacetedPlotComponent: ComponentWithPlotRef<P>
) {
  const FacetedPlotComponent = forwardRef<
    FacetedPlotRef,
    FacetedPlotProps<D, P>
  >(renderFacetedPlot);

  FacetedPlotComponent.displayName = `FacetedPlotComponent(${
    UnfacetedPlotComponent.displayName || UnfacetedPlotComponent.name
  })`;

  return FacetedPlotComponent;
});

export default function FacetedPlot<D, P extends PlotProps<D>>(
  props: FacetedPlotProps<D, P> & { facetedPlotRef?: Ref<FacetedPlotRef> }
) {
  const FacetedPlotComponent = makeFacetedPlotComponent<D, P>(props.component);

  return <FacetedPlotComponent {...props} ref={props.facetedPlotRef} />;
}
