import React, { lazy, Suspense, useMemo, CSSProperties } from 'react';
import { PlotParams } from 'react-plotly.js';
import { legendSpecification } from '../utils/plotly';
import Spinner from '../components/Spinner';
import { PlotLegendAddon, PlotSpacingAddon } from '../types/plots/addOns';
import { UnionOfPlotDataTypes } from '../types/plots';
import { LayoutLegendTitle } from '../types/plotly-omissions';

export interface PlotProps<T extends UnionOfPlotDataTypes> {
  /** plot data - following web-components' API, not Plotly's */
  data: T;
  /** Title of plot. */
  title?: string;
  /** Should plot legend be displayed? Default is yes */
  displayLegend?: boolean;
  /** add CSS styles for plot component
   * Note: if playing around with Storybook controls, changes
   * to containerStyles only seem to take effect when resizing
   * the story window.  Resizing seems to be responsive whether
   * or not `responsive: true` in the plot config...
   *
   * Defaults:  { width: '100%', height: '400px' }
   */
  containerStyles?: CSSProperties;
  /** Enables mouse-overs and interaction if true. Default false. */
  interactive?: boolean;
  /** show Plotly's mode bar (only shows if interactive == true) */
  displayLibraryControls?: boolean;
  /** show a loading... spinner in the middle of the enclosing div */
  showSpinner?: boolean;
  /** Options for customizing plot legend layout and appearance. */
  legendOptions?: PlotLegendAddon;
  /** legend title */
  legendTitle?: string;
  /** Options for customizing plot placement. */
  spacingOptions?: PlotSpacingAddon;
}

const Plot = lazy(() => import('react-plotly.js'));

const defaultStyles = {
  height: '400px',
  width: '100%',
};

/**
 * Wrapper over the `react-plotly.js` `Plot` component
 *
 * @param props : PlotProps & PlotParams
 *
 * Takes all Plotly props (PlotParams) and our own PlotProps for
 * controlling global things like spinner, library controls etc
 *
 */
export default function PlotlyPlot<T extends UnionOfPlotDataTypes>(
  props: Omit<PlotProps<T>, 'data'> & PlotParams
) {
  const {
    title,
    displayLegend = true,
    containerStyles,
    interactive = false,
    displayLibraryControls,
    legendOptions,
    legendTitle,
    spacingOptions,
    showSpinner,
    ...plotlyProps
  } = props;

  const finalStyle = useMemo(
    (): PlotParams['style'] => ({
      ...defaultStyles,
      ...containerStyles,
    }),
    [containerStyles]
  );

  // config is derived purely from PlotProps props
  const finalConfig = useMemo(
    (): PlotParams['config'] => ({
      responsive: true,
      displaylogo: false,
      displayModeBar: displayLibraryControls ? 'hover' : false,
      staticPlot: !interactive,
    }),
    [displayLibraryControls, interactive]
  );

  const finalLayout = useMemo(
    (): PlotParams['layout'] & LayoutLegendTitle => ({
      ...plotlyProps.layout,
      xaxis: {
        ...plotlyProps.layout.xaxis,
        fixedrange: true,
        linewidth: 1,
        linecolor: 'black',
      },
      yaxis: {
        ...plotlyProps.layout.yaxis,
        fixedrange: true,
        linewidth: 1,
        linecolor: 'black',
      },
      title: {
        text: title,
        font: {
          family: 'Arial, Helvetica, sans-serif',
        },
        xref: 'paper',
        x: 0,
        xanchor: 'left', // left aligned to left edge (y-axis) of plot
      },
      showlegend: displayLegend ?? true,
      margin: {
        t: spacingOptions?.marginTop,
        r: spacingOptions?.marginRight,
        b: spacingOptions?.marginBottom,
        l: spacingOptions?.marginLeft,
        pad: spacingOptions?.padding || 0, // axes don't join up if >0
      },
      legend: {
        title: {
          text: legendTitle,
        },
        ...(legendOptions ? legendSpecification(legendOptions) : {}),
      },
    }),
    [plotlyProps.layout, spacingOptions, legendOptions, displayLegend]
  );

  return (
    <Suspense fallback="Loading...">
      <Plot
        {...plotlyProps}
        layout={finalLayout}
        style={finalStyle}
        config={finalConfig}
      />
      {showSpinner && <Spinner />}
    </Suspense>
  ); // FIXME: Spinner currently showing in middle of enclosing div rather than middle of plot.
}
