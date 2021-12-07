import Heatmap, { HeatmapProps } from '../Heatmap';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { HeatmapData } from '../../types/plots';

export const defaultContainerStyles: HeatmapProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: HeatmapProps['spacingOptions'] = {
  marginRight: 10,
  marginLeft: 25,
  marginBottom: 40,
  marginTop: 60,
};

type FacetedHeatmapProps = Omit<
  FacetedPlotProps<HeatmapData, HeatmapProps>,
  'component'
>;

const FacetedHeatmap = (facetedHeatmapProps: FacetedHeatmapProps) => {
  return (
    <FacetedPlot
      component={Heatmap}
      {...facetedHeatmapProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedHeatmapProps.componentProps,
      }}
    />
  );
};

export default FacetedHeatmap;
