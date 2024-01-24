import BarPlot, { BarPlotProps } from '../BarPlot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { BarPlotData } from '../../types/plots';

export const defaultContainerStyles: BarPlotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: BarPlotProps['spacingOptions'] = {
  marginRight: 10,
  marginLeft: 10,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedBarPlotProps = Omit<
  FacetedPlotPropsWithRef<BarPlotData, BarPlotProps>,
  'component'
>;

const FacetedBarPlot = (facetedBarPlotProps: FacetedBarPlotProps) => {
  const { componentProps } = facetedBarPlotProps;

  return (
    <FacetedPlot
      component={BarPlot}
      {...facetedBarPlotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedBarPlot;
