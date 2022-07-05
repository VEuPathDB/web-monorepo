import Histogram, { HistogramProps } from '../Histogram';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { HistogramData } from '../../types/plots';

export const defaultContainerStyles: HistogramProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: HistogramProps['spacingOptions'] = {
  marginRight: 10,
  marginLeft: 10,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedHistogramProps = Omit<
  FacetedPlotPropsWithRef<HistogramData, HistogramProps>,
  'component'
>;

const FacetedHistogram = (facetedHistogramProps: FacetedHistogramProps) => {
  const { componentProps } = facetedHistogramProps;

  return (
    <FacetedPlot
      component={Histogram}
      {...facetedHistogramProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedHistogram;
