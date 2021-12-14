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

import Modal from '@veupathdb/core-components/dist/components/containers/Modal';

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

export interface FacetedPlotPropsWithRef<D, P extends PlotProps<D>>
  extends FacetedPlotProps<D, P> {
  facetedPlotRef?: Ref<FacetedPlotRef>;
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
        <Modal
          visible={modalIsOpen}
          includeCloseButton
          toggleVisible={setModalIsOpen}
        >
          <div style={{ height: 50 }} />
          {modalPlot}
        </Modal>
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
  props: FacetedPlotPropsWithRef<D, P>
) {
  const FacetedPlotComponent = makeFacetedPlotComponent<D, P>(props.component);

  return <FacetedPlotComponent {...props} ref={props.facetedPlotRef} />;
}
