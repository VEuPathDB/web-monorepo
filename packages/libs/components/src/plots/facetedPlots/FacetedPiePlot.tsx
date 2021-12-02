import PiePlot, { PiePlotProps } from '../PiePlot';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { PiePlotData } from '../../types/plots';

const defaultContainerStyles: PiePlotProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const defaultSpacingOptions: PiePlotProps['spacingOptions'] = {
  marginRight: 10,
  marginLeft: 10,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedPiePlotProps = Omit<
  FacetedPlotProps<PiePlotData, PiePlotProps>,
  'component'
>;

const FacetedPiePlot = (facetedPiePlotProps: FacetedPiePlotProps) => {
  return (
    <FacetedPlot
      component={PiePlot}
      {...facetedPiePlotProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedPiePlotProps.componentProps,
      }}
    />
  );
};

export default FacetedPiePlot;
