import React, {
  ComponentType,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

import { memoize } from 'lodash';

import { FacetedData, FacetedPlotRef, PlotRef } from '../types/plots';
import { PlotProps } from './PlotlyPlot';

type ComponentWithPlotRef<P> = ComponentType<
  PropsWithoutRef<P> & RefAttributes<PlotRef>
>;

export interface FacetedPlotProps<D, P extends PlotProps<D>> {
  data?: FacetedData<D>;
  component: ComponentWithPlotRef<P>;
  props: P;
  // custom legend prop
  checkedLegendItems?: string[];
}

function renderFacetedPlot<D, P extends PlotProps<D>>(
  props: FacetedPlotProps<D, P>,
  ref: Ref<FacetedPlotRef>
) {
  const {
    data,
    component: Component,
    props: componentProps,
    checkedLegendItems: checkedLegendItems,
  } = props;
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

  return (
    <div>
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
            ref={(plotInstance) => {
              if (plotInstance == null) {
                delete plotRefs.current[index];
              } else {
                plotRefs.current[index] = plotInstance;
              }
            }}
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
    </div>
  );
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
