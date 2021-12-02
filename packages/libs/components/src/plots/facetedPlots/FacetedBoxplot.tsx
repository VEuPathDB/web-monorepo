import Boxplot, { BoxplotProps } from '../Boxplot';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { BoxplotData } from '../../types/plots';

const defaultContainerStyles: BoxplotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const defaultSpacingOptions: BoxplotProps['spacingOptions'] = {
  marginRight: 15,
  marginLeft: 15,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedBoxplotProps = Omit<
  FacetedPlotProps<BoxplotData, BoxplotProps>,
  'component'
>;

const FacetedBoxplot = (facetedBoxplotProps: FacetedBoxplotProps) => {
  return (
    <FacetedPlot
      component={Boxplot}
      {...facetedBoxplotProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedBoxplotProps.componentProps,
      }}
    />
  );
};

export default FacetedBoxplot;
