import PiePlot, { PiePlotProps } from '../PiePlot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { PiePlotData } from '../../types/plots';
import { useCallback } from 'react';
import { select } from 'd3';

export const defaultContainerStyles: PiePlotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: PiePlotProps['spacingOptions'] = {
  marginRight: 10,
  marginLeft: 10,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedPiePlotProps = Omit<
  FacetedPlotPropsWithRef<PiePlotData, PiePlotProps>,
  'component'
>;

const FacetedPiePlot = (facetedPiePlotProps: FacetedPiePlotProps) => {
  const { componentProps } = facetedPiePlotProps;
  const onPlotlyRender = useCallback((_, graphDiv) => {
    // Replace each slice DOM node with a copy of itself.
    // This removes the existing click event handler, which
    // otherwise blocks the click handler that opens the modal
    const parentNode = select(graphDiv).select('g.trace');
    const sliceNodes = parentNode.selectAll('g.slice');
    sliceNodes.each(function () {
      const sliceNode = select(this);
      const clone = sliceNode.clone(true);
      parentNode.insert(
        () => clone.node(),
        () => this
      );
      sliceNode.remove();
    });
  }, []);

  return (
    <FacetedPlot
      component={PiePlot}
      {...facetedPiePlotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
        onPlotlyRender,
      }}
    />
  );
};

export default FacetedPiePlot;
