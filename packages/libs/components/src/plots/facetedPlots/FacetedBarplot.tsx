import Barplot, { BarplotProps } from '../Barplot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { BarplotData } from '../../types/plots';

export const defaultContainerStyles: BarplotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginBottom: '0.25rem',
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
  FacetedPlotPropsWithRef<BarplotData, BarplotProps>,
  'component'
>;

const FacetedBarplot = (facetedBarplotProps: FacetedBarplotProps) => {
  const { componentProps } = facetedBarplotProps;

  return (
    <FacetedPlot
      component={Barplot}
      {...facetedBarplotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedBarplot;
