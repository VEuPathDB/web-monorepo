import React, { lazy, Suspense, useMemo, CSSProperties } from 'react';
import { PlotParams } from 'react-plotly.js';
import { legendSpecification } from '../utils/plotly';
import Spinner from '../components/Spinner';
import { PlotLegendAddon, PlotSpacingAddon } from '../types/plots/addOns';
import { LayoutLegendTitle } from '../types/plotly-omissions';
import { FacetedData } from '../types/plots';

export interface PlotProps<T> {
  /** plot data - following web-components' API, not Plotly's */
  data?: T | FacetedData<T>;
  /** Title of plot. */
  title?: string;
  /** Should plot legend be displayed? Default is yes */
  displayLegend?: boolean;
  /** CSS styles for enclosing div
   * Default is { width: '100%', height: '400px' }
   */
  containerStyles?: CSSProperties;
  /** Enables mouse-overs and interaction if true. Default false. */
  interactive?: boolean;
  /** show Plotly's mode bar (only shows if interactive == true) */
  displayLibraryControls?: boolean;
  /** show a loading... spinner in the middle of the container div */
  showSpinner?: boolean;
  /** Options for customizing plot legend layout and appearance. */
  legendOptions?: PlotLegendAddon;
  /** legend title */
  legendTitle?: string;
  /** Options for customizing plot placement. */
  spacingOptions?: PlotSpacingAddon;
}

const Plot = lazy(() => import('react-plotly.js'));

/**
 * Wrapper over the `react-plotly.js` `Plot` component
 *
 * @param props : PlotProps & PlotParams
 *
 * Takes all Plotly props (PlotParams) and our own PlotProps for
 * controlling global things like spinner, library controls etc
 *
 */
export default function PlotlyPlot<T>(
  props: Omit<PlotProps<T>, 'data'> & PlotParams
) {
  const {
    title,
    displayLegend = true,
    containerStyles = { width: '100%', height: '400px' },
    interactive = false,
    displayLibraryControls,
    legendOptions,
    legendTitle,
    spacingOptions,
    showSpinner,
    ...plotlyProps
  } = props;

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
      autosize: true, // responds properly to enclosing div resizing (not to be confused with config.responsive)
    }),
    [
      plotlyProps.layout,
      spacingOptions,
      legendOptions,
      displayLegend,
      legendTitle,
      title,
    ]
  );

  return (
    <Suspense fallback="Loading...">
      <div style={{ ...containerStyles, position: 'relative' }}>
        <Plot
          {...plotlyProps}
          layout={finalLayout}
          style={{ width: '100%', height: '100%' }}
          config={finalConfig}
        />
        {showSpinner && <Spinner />}
      </div>
    </Suspense>
  );
}
