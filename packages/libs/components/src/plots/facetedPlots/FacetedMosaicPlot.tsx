import MosaicPlot, { MosaicPlotProps } from '../MosaicPlot';
import FacetedPlot, { FacetedPlotProps } from '../FacetedPlot';
import { MosaicPlotData } from '../../types/plots';

/** What to do with these? */
// const statsTableStyles = {
//   width: plotContainerStyles.width,
// };

// const facetedStatsTableStyles = {};

// const facetedStatsTableContainerStyles = {
//   display: 'grid',
//   gridAutoFlow: 'column',
//   gridAutoColumns: 'max-content',
//   alignItems: 'flex-start',
//   width: '100%',
//   overflow: 'auto',
//   gap: '0.5em',
// };

const defaultContainerStyles: MosaicPlotProps['containerStyles'] = {
  height: 360,
  width: 750 / 1.45,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const defaultSpacingOptions: MosaicPlotProps['spacingOptions'] = {
  marginRight: 15,
  marginLeft: 15,
  marginBottom: 10,
  marginTop: 50,
};

type FacetedMosaicPlotProps = Omit<
  FacetedPlotProps<MosaicPlotData, MosaicPlotProps>,
  'component'
>;

const FacetedMosaicPlot = (facetedMosaicPlotProps: FacetedMosaicPlotProps) => {
  return (
    <FacetedPlot
      component={MosaicPlot}
      {...facetedMosaicPlotProps}
      componentProps={{
        containerStyles: defaultContainerStyles,
        spacingOptions: defaultSpacingOptions,
        ...facetedMosaicPlotProps.componentProps,
      }}
    />
  );
};

export default FacetedMosaicPlot;
