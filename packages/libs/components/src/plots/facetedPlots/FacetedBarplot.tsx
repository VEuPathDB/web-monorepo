import Barplot, { BarplotProps } from '../Barplot';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { BarplotData } from '../../types/plots';

export const defaultContainerStyles: BarplotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: BarplotProps['spacingOptions'] = {
  marginRight: 10,
  marginLeft: 10,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedBarplotProps = Omit<
  FacetedPlotProps<BarplotData, BarplotProps>,
  'component'
>;

const FacetedBarplot = (facetedBarplotProps: FacetedBarplotProps) => {
  return (
    <FacetedPlot
      component={Barplot}
      {...facetedBarplotProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedBarplotProps.componentProps,
      }}
    />
  );
};

export default FacetedBarplot;
