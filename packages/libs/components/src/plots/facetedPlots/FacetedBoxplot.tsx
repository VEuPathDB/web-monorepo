import Boxplot, { BoxplotProps } from '../Boxplot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { BoxplotData } from '../../types/plots';

export const defaultContainerStyles: BoxplotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: BoxplotProps['spacingOptions'] = {
  marginRight: 15,
  marginLeft: 15,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedBoxplotProps = Omit<
  FacetedPlotPropsWithRef<BoxplotData, BoxplotProps>,
  'component'
>;

const FacetedBoxplot = (facetedBoxplotProps: FacetedBoxplotProps) => {
  const { componentProps } = facetedBoxplotProps;

  return (
    <FacetedPlot
      component={Boxplot}
      {...facetedBoxplotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedBoxplot;
