import { useMemo } from 'react';
import { PlotContainerStyleOverrides } from './VisualizationTypes';

/**
 * Container styles shared by (most) fullscreen visualization plots.
 * Visualizations with different dimensions can spread this and override.
 */
export const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

/** Container styles for plots rendered in the faceted-plot modal. */
export const modalPlotContainerStyles = {
  width: '85%',
  height: '100%',
  margin: 'auto',
};

/**
 * Merges the standard plot container styles with any overrides provided
 * via the `plotContainerStyleOverrides` visualization prop.
 */
export function usePlotContainerStyles(
  plotContainerStyleOverrides?: PlotContainerStyleOverrides,
  baseStyles: PlotContainerStyleOverrides = plotContainerStyles
) {
  return useMemo(
    () => ({
      ...baseStyles,
      ...plotContainerStyleOverrides,
    }),
    [baseStyles, plotContainerStyleOverrides]
  );
}
