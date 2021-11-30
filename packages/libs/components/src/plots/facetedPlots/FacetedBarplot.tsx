import Barplot, { BarplotProps } from '../Barplot';

const facetedPlotContainerStyles = {
  height: 300,
  width: 375,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const facetedPlotSpacingOptions = {
  marginRight: 10,
  marginLeft: 10,
  marginBotton: 10,
  marginTop: 50,
};

const FacetedBarplot = ({
  containerStyles = facetedPlotContainerStyles,
  spacingOptions = facetedPlotSpacingOptions,
  ...restProps
}: BarplotProps) => (
  <Barplot
    containerStyles={containerStyles}
    spacingOptions={spacingOptions}
    {...restProps}
  />
);

export default FacetedBarplot;
