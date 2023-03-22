import Heatmap, { HeatmapProps } from '../Heatmap';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { HeatmapData } from '../../types/plots';

export const defaultContainerStyles: HeatmapProps['containerStyles'] = {
  height: 300,
  width: 375,
  marginBottom: '0.25rem',
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
  FacetedPlotPropsWithRef<HeatmapData, HeatmapProps>,
  'component'
>;

const FacetedHeatmap = (facetedHeatmapProps: FacetedHeatmapProps) => {
  const { componentProps } = facetedHeatmapProps;

  return (
    <FacetedPlot
      component={Heatmap}
      {...facetedHeatmapProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedHeatmap;
