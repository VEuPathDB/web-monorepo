import React, {
  lazy,
  Suspense,
  useMemo,
  useCallback,
  CSSProperties,
  Ref,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { PlotParams } from 'react-plotly.js';
import { legendSpecification } from '../utils/plotly';
import Spinner from '../components/Spinner';
import {
  PlotLegendAddon,
  PlotSpacingAddon,
  ColorPaletteAddon,
  ColorPaletteDefault,
} from '../types/plots/addOns';
import { LayoutLegendTitle } from '../types/plotly-omissions';
// add d3.select
import { select } from 'd3';
import { ToImgopts, toImage } from 'plotly.js';
import { uniqueId } from 'lodash';

export interface PlotRef {
  toImage: (imageOpts: ToImgopts) => Promise<string>;
}

export interface PlotProps<T> extends ColorPaletteAddon {
  /** plot data - following web-components' API, not Plotly's */
  data?: T;
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
  /** maximum number of characters for legend ellipsis */
  maxLegendTextLength?: number;
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
function PlotlyPlot<T>(
  props: Omit<PlotProps<T>, 'data'> & PlotParams,
  ref: Ref<PlotRef>
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
    // set default max number of characters (20) for legend ellipsis
    maxLegendTextLength = 20,
    // expose data for applying legend ellipsis
    data,
    colorPalette = ColorPaletteDefault,
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
      colorway: colorPalette,
    }),
    [
      plotlyProps.layout,
      spacingOptions,
      legendOptions,
      displayLegend,
      legendTitle,
      title,
      colorPalette,
    ]
  );

  /**
   * legend ellipsis with tooltip
   */
  const storedLegendList = useMemo(() => {
    if (data != null) {
      return data.map((data) => {
        return data.name ?? '';
      });
    } else {
      return [];
    }
  }, [data]);

  // add legend tooltip function
  const onUpdate = useCallback(
    (_, graphDiv: Readonly<HTMLElement>) => {
      // remove pre-existing title to avoid duplicates
      select(graphDiv)
        .select('g.legend')
        .selectAll('g.traces')
        .selectAll('title')
        .remove();
      // add tooltip using svg title
      select(graphDiv)
        .select('g.legend')
        .selectAll('g.traces')
        .append('svg:title')
        .text((d) => storedLegendList[d[0].trace.index]);
    },
    [storedLegendList]
  );

  // set the number of characters to be displayed
  const maxLegendText = maxLegendTextLength;
  // change data.name with ellipsis
  const finalData = data.map((d) => ({
    ...d,
    name:
      (d.name || '').length > maxLegendText
        ? (d.name || '').substring(0, maxLegendText) + '...'
        : d.name,
  }));

  const plotId = useMemo(() => uniqueId('plotly_plot_div_'), []);

  useImperativeHandle<PlotRef, PlotRef>(ref, () => ({
    toImage: async (imageOpts: ToImgopts) => {
      return toImage(plotId, imageOpts);
    },
  }));

  return (
    <Suspense fallback="Loading...">
      <div style={{ ...containerStyles, position: 'relative' }}>
        <Plot
          {...plotlyProps}
          divId={plotId}
          // need to set data props for modigying its name prop
          data={finalData}
          layout={finalLayout}
          style={{ width: '100%', height: '100%' }}
          config={finalConfig}
          // use onUpdate event handler for legend tooltip
          onUpdate={onUpdate}
        />
        {showSpinner && <Spinner />}
      </div>
    </Suspense>
  );
}

export default forwardRef(PlotlyPlot);
