import XYPlot, { XYPlotProps } from '../XYPlot';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { XYPlotData } from '../../types/plots';

export const defaultContainerStyles: XYPlotProps['containerStyles'] = {
  height: 300,
  width: 750 / 1.75,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: XYPlotProps['spacingOptions'] = {
  marginRight: 20,
  marginLeft: 50,
  marginBottom: 40,
  marginTop: 50,
};

type FacetedXYPlotProps = Omit<
  FacetedPlotProps<XYPlotData, XYPlotProps>,
  'component'
>;

const FacetedXYPlot = (facetedXYPlotProps: FacetedXYPlotProps) => {
  return (
    <FacetedPlot
      component={XYPlot}
      {...facetedXYPlotProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedXYPlotProps.componentProps,
      }}
    />
  );
};

export default FacetedXYPlot;
