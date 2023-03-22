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

import { Modal } from '@veupathdb/coreui';

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
  const contentPadding = 20;

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
          display: 'flex',
          columnGap: '2.5em',
          overflow: 'auto',
        }}
      >
        {data?.facets.map(({ data, label }, index) => {
          const sharedProps = {
            data: data,
            ...componentProps,
            // pass checkedLegendItems to PlotlyPlot
            checkedLegendItems: checkedLegendItems,
            showNoDataOverlay: data == null,
          };

          const UntypedComponent: any = Component;

          const divModalProps = modalComponentProps && {
            onClick: () => {
              setModalPlot(
                <UntypedComponent
                  {...sharedProps}
                  displayLegend={true}
                  interactive={true}
                  {...modalComponentProps}
                  title={label}
                  useResizeHandler
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
                cursor: modalComponentProps && 'pointer',
              }}
            >
              <UntypedComponent
                {...sharedProps}
                ref={(plotInstance: PlotRef) => {
                  if (plotInstance == null) {
                    delete plotRefs.current[index];
                  } else {
                    plotRefs.current[index] = plotInstance;
                  }
                }}
                displayLegend={false}
                interactive={false}
                title={label}
              />
            </div>
          );
        })}
      </div>
      {modalComponentProps && modalIsOpen && (
        <Modal
          visible={modalIsOpen}
          includeCloseButton
          toggleVisible={setModalIsOpen}
          styleOverrides={{
            content: {
              padding: {
                top: contentPadding,
                bottom: contentPadding,
                left: contentPadding,
                right: contentPadding,
              },
              size: { width: '100%', height: '100%' },
            },
          }}
        >
          {modalPlot}
        </Modal>
      )}
    </>
  );
}

const makeFacetedPlotComponent = memoize(function <D, P extends PlotProps<D>>(
  UnfacetedPlotComponent: ComponentWithPlotRef<P>
) {
  const FacetedPlotComponent =
    forwardRef<FacetedPlotRef, FacetedPlotProps<D, P>>(renderFacetedPlot);

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
