import LinePlot, { LinePlotProps } from '../LinePlot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { LinePlotData } from '../../types/plots';

export const defaultContainerStyles: LinePlotProps['containerStyles'] = {
  height: 300,
  width: 750 / 1.75,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: LinePlotProps['spacingOptions'] = {
  marginRight: 20,
  marginLeft: 50,
  marginBottom: 40,
  marginTop: 50,
};

type FacetedLinePlotProps = Omit<
  FacetedPlotPropsWithRef<LinePlotData, LinePlotProps>,
  'component'
>;

const FacetedLinePlot = (facetedLinePlotProps: FacetedLinePlotProps) => {
  const { componentProps } = facetedLinePlotProps;

  return (
    <FacetedPlot
      component={LinePlot}
      {...facetedLinePlotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedLinePlot;
