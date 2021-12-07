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
  componentProps: P;
  /** Provide modalComponentProps to activate click-to-expand
   * These are the props the expanded plot inside the modal will receive
   */
  modalComponentProps?: P;
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
    componentProps,
    modalComponentProps,
    checkedLegendItems,
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
          const sharedProps = {
            data: data,
            // pass checkedLegendItems to PlotlyPlot
            checkedLegendItems: checkedLegendItems,
            showNoDataOverlay: data == null,
          };

          const divModalProps = modalComponentProps && {
            onClick: () => {
              setModalPlot(
                <Component
                  {...sharedProps}
                  displayLegend={true}
                  interactive={true}
                  {...modalComponentProps}
                  title={label}
                />
              );
              setModalIsOpen(true);
            },
            title: 'Click to expand',
          };

          return (
            <div
              {...divModalProps}
              key={index}
              style={{
                marginRight: 15,
                cursor: modalComponentProps && 'pointer',
              }}
            >
              <Component
                {...sharedProps}
                ref={(plotInstance) => {
                  if (plotInstance == null) {
                    delete plotRefs.current[index];
                  } else {
                    plotRefs.current[index] = plotInstance;
                  }
                }}
                displayLegend={false}
                interactive={false}
                {...componentProps}
                title={label}
              />
            </div>
          );
        })}
      </div>
      {modalComponentProps && (
        <FullScreenModal visible={modalIsOpen}>
          <button
            onClick={() => setModalIsOpen(false)}
            style={{
              position: 'absolute',
              top: 30,
              right: 30,
              backgroundColor: 'white',
              cursor: 'pointer',
              border: 'none',
              zIndex: 2000,
            }}
          >
            <i className="fas fa-times fa-lg"></i>
          </button>
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
