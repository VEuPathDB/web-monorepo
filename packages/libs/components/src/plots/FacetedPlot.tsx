import React, {
  ComponentType,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { memoize } from 'lodash';

import { FacetedData, FacetedPlotRef, PlotRef } from '../types/plots';
import { PlotProps } from './PlotlyPlot';

import { FullScreenModal } from '@veupathdb/core-components';

type ComponentWithPlotRef<P> = ComponentType<
  PropsWithoutRef<P> & RefAttributes<PlotRef>
>;

export interface FacetedPlotProps<D, P extends PlotProps<D>> {
  data?: FacetedData<D>;
  component: ComponentWithPlotRef<P>;
  props: P;
  modalProps?: P;
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
    modalProps: modalComponentProps,
    checkedLegendItems: checkedLegendItems,
  } = props;
  const plotRefs = useRef<FacetedPlotRef>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPlot, setModalPlot] = useState<React.ReactNode | null>(null);

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
        {data?.facets.map(({ data, label }, index) => {
          const component = (
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
              showNoDataOverlay={data == null}
            />
          );

          const modalComponent = modalComponentProps && (
            <Component
              {...modalComponentProps}
              // ref={(plotInstance) => {
              //   if (plotInstance == null) {
              //     delete plotRefs.current[index];
              //   } else {
              //     plotRefs.current[index] = plotInstance;
              //   }
              // }}
              // key={index}
              data={data}
              title={label}
              displayLegend={true}
              interactive={true}
              // pass checkedLegendItems to PlotlyPlot
              checkedLegendItems={checkedLegendItems}
              showNoDataOverlay={data == null}
            />
          );

          return modalComponentProps ? (
            <button
              onClick={() => {
                setModalPlot(modalComponent);
                setModalIsOpen(true);
              }}
            >
              {component}
            </button>
          ) : (
            <>{component}</>
          );
        })}
      </div>
      {modalComponentProps && (
        <FullScreenModal
          visible={modalIsOpen}
          // onClose={() => setModalIsOpen(false)}
        >
          <button onClick={() => setModalIsOpen(false)}>Close</button>
          {modalPlot}
        </FullScreenModal>
      )}
    </>
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
