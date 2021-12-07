import Histogram, { HistogramProps } from '../Histogram';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { HistogramData } from '../../types/plots';

export const defaultContainerStyles: HistogramProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginLeft: '0.75rem',
  marginBottom: '.5em',
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
  FacetedPlotProps<HistogramData, HistogramProps>,
  'component'
>;

const FacetedHistogram = (facetedHistogramProps: FacetedHistogramProps) => {
  return (
    <FacetedPlot
      component={Histogram}
      {...facetedHistogramProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedHistogramProps.componentProps,
      }}
    />
  );
};

export default FacetedHistogram;
