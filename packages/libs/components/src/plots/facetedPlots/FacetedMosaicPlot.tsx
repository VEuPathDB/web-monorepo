import MosaicPlot, { MosaicPlotProps } from '../MosaicPlot';
import FacetedPlot, { FacetedPlotPropsWithRef } from '../FacetedPlot';
import { MosaicPlotData } from '../../types/plots';

export const defaultContainerStyles: MosaicPlotProps['containerStyles'] = {
  height: 360,
  width: 750 / 1.45,
  marginBottom: '0.25rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const defaultSpacingOptions: MosaicPlotProps['spacingOptions'] = {
  marginRight: 15,
  marginLeft: 15,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedMosaicPlotProps = Omit<
  FacetedPlotPropsWithRef<MosaicPlotData, MosaicPlotProps>,
  'component'
>;

const FacetedMosaicPlot = (facetedMosaicPlotProps: FacetedMosaicPlotProps) => {
  const { componentProps } = facetedMosaicPlotProps;

  return (
    <FacetedPlot
      component={MosaicPlot}
      {...facetedMosaicPlotProps}
      componentProps={{
        ...componentProps,
        containerStyles:
          componentProps.containerStyles ?? defaultContainerStyles,
        spacingOptions: componentProps.spacingOptions ?? defaultSpacingOptions,
      }}
    />
  );
};

export default FacetedMosaicPlot;
