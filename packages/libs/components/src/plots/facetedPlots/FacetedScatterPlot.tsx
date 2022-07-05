import ScatterPlot, { ScatterPlotProps } from '../ScatterPlot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { ScatterPlotData } from '../../types/plots';

export const defaultContainerStyles: ScatterPlotProps['containerStyles'] = {
  height: 300,
  width: 750 / 1.75,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: ScatterPlotProps['spacingOptions'] = {
  marginRight: 20,
  marginLeft: 50,
  marginBottom: 40,
  marginTop: 50,
};

type FacetedScatterPlotProps = Omit<
  FacetedPlotPropsWithRef<ScatterPlotData, ScatterPlotProps>,
  'component'
>;

const FacetedScatterPlot = (
  facetedScatterPlotProps: FacetedScatterPlotProps
) => {
  const { componentProps } = facetedScatterPlotProps;

  return (
    <FacetedPlot
      component={ScatterPlot}
      {...facetedScatterPlotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedScatterPlot;
