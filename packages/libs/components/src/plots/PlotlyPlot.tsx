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
import { makeSharedPromise } from '../utils/promise-utils';

/**
 * A generic imperative interface to plota. This allows us to create a facade
 * to interact with plot internals, such as exporting an image.
 */

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
  /** class name for enclosing div. Default is web-components-plot */
  containerClass?: string;
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
  /** original independent axis tick labels as data is changed at each component (barplot and boxplot)*/
  storedIndependentAxisTickLabel?: string[];
  /** checked checkbox array for legend items */
  checkedLegendItems?: string[];
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
    containerClass = 'web-components-plot',
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
    // original independent axis tick labels for tooltip text
    storedIndependentAxisTickLabel,
    //DKDK checkbox
    checkedLegendItems,
    colorPalette = ColorPaletteDefault,
    ...plotlyProps
  } = props;

  // set max legend title length for ellipsis
  const maxLegendTitleTextLength = maxLegendTextLength + 5;
  // set max dependent axis title length for ellipsis
  const maxDependentAxisTitleTextLength = 50;

  /** This is used to ensure toImage is called after the plot has been created */
  const sharedPlotCreation = useMemo(
    () => makeSharedPromise(async () => {}),
    []
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
        // change long delendent axis title with ellipsis
        title:
          ((plotlyProps?.layout?.yaxis?.title as string) || '').length >
          maxDependentAxisTitleTextLength
            ? ((plotlyProps?.layout?.yaxis?.title as string) || '').substring(
                0,
                maxDependentAxisTitleTextLength
              ) + '...'
            : plotlyProps?.layout?.yaxis?.title,
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
        ...plotlyProps.layout.legend,
        title: {
          // add ellipsis for legendTitle
          text:
            (legendTitle || '').length > maxLegendTitleTextLength
              ? (legendTitle || '').substring(0, maxLegendTitleTextLength) +
                '...'
              : legendTitle,
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

  // keep dependent axis title for tooltip text
  const originalDependentAxisTitle = useMemo(
    () => plotlyProps?.layout?.yaxis?.title,
    [plotlyProps?.layout?.yaxis?.title]
  );

  // ellipsis with tooltip for legend, legend title, and independent axis tick labels
  const onUpdate = useCallback(
    (_, graphDiv: Readonly<HTMLElement>) => {
      // legend tooltip
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
        .text((d: any) => {
          return storedLegendList[d[0].trace.index];
        });

      // legend title tooltip
      // remove pre-existing svg:title under legendtitletext to avoid duplicates
      select(graphDiv)
        .select('g.legend g.scrollbox text.legendtitletext')
        .selectAll('title')
        .remove();
      // add tooltip: no need to show tooltip if legent title is not that long
      if (
        legendTitle != null &&
        legendTitle.length > maxLegendTitleTextLength
      ) {
        select(graphDiv)
          .select('g.legend g.scrollbox text.legendtitletext')
          .append('svg:title')
          .text(legendTitle);
      }

      // independent axis tick label for barplot and boxplot
      if (
        storedIndependentAxisTickLabel != null &&
        storedIndependentAxisTickLabel.length > 0
      ) {
        // remove pre-existing xtick.title
        select(graphDiv)
          .select(
            '.plot-container svg.main-svg g.cartesianlayer g.xaxislayer-above'
          )
          .selectAll('g.xtick')
          .selectAll('title')
          .remove();

        // add xtick.title (tooltip)
        select(graphDiv)
          .select(
            '.plot-container svg.main-svg g.cartesianlayer g.xaxislayer-above'
          )
          .selectAll('g.xtick')
          // need this attribute for tooltip of axis tick label!
          .attr('pointer-events', 'all')
          .append('svg:title')
          .text((d, i) => {
            return storedIndependentAxisTickLabel != null
              ? (storedIndependentAxisTickLabel[i] as string)
              : '';
          });
      }

      // handling dependent axis title with ellipsis & tooltip
      if (
        originalDependentAxisTitle != null &&
        (originalDependentAxisTitle as string).length >
          maxDependentAxisTitleTextLength
      ) {
        // remove duplicate svg:title
        select(graphDiv)
          .select('.plot-container svg.main-svg g.infolayer g.g-ytitle')
          .selectAll('title')
          .remove();

        // add tooltip
        select(graphDiv)
          .select(
            '.plot-container svg.main-svg g.infolayer g.g-ytitle text.ytitle'
          )
          // need this attribute for tooltip of dependent axis title!
          .attr('pointer-events', 'all')
          .append('svg:title')
          .text(originalDependentAxisTitle as string);
      }
    },
    [
      storedLegendList,
      legendTitle,
      maxLegendTitleTextLength,
      storedIndependentAxisTickLabel,
      originalDependentAxisTitle,
    ]
  );

  //DKDK
  console.log('checkedLegendItems at PlotlyPlot=', checkedLegendItems);

  const finalData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      //DKDK legend checkbox: change 'true' case to 'legendonly' as 'true' changes plot colors
      visible:
        checkedLegendItems != null && d.name != null
          ? checkedLegendItems?.includes(d.name)
            ? true
            : 'legendonly'
          : undefined,
      // ellipsis for legend item
      name:
        (d.name || '').length > maxLegendTextLength
          ? (d.name || '').substring(0, maxLegendTextLength) + '...'
          : d.name,
    }));
  }, [data, checkedLegendItems]); // add checkedLegendItems

  const plotId = useMemo(() => uniqueId('plotly_plot_div_'), []);

  useImperativeHandle<PlotRef, PlotRef>(
    ref,
    () => ({
      toImage: async (imageOpts: ToImgopts) => {
        try {
          await sharedPlotCreation.promise;
          return await toImage(plotId, imageOpts);
        } catch (error) {
          console.error('Could not create image for plot:', error);
        }
        return '';
      },
    }),
    [plotId]
  );

  return (
    <Suspense fallback="Loading...">
      <div
        className={containerClass}
        style={{ ...containerStyles, position: 'relative' }}
      >
        <Plot
          {...plotlyProps}
          divId={plotId}
          // need to set data props for modigying its name prop
          data={finalData as Plotly.Data[]}
          layout={finalLayout}
          style={{ width: '100%', height: '100%' }}
          config={finalConfig}
          // use onUpdate event handler for legend tooltip
          onUpdate={onUpdate}
          onInitialized={sharedPlotCreation.run}
        />
        {showSpinner && <Spinner />}
      </div>
    </Suspense>
  );
}

const PlotlyPlotWithRef = forwardRef(PlotlyPlot);

/**
 * Factory function to create a component that delegates to `PlotlyPlotWithRef`.
 * This encapsulates ref forwarding. See {@link PlotRef}.
 */
export function makePlotlyPlotComponent<S extends { data?: T }, T>(
  displayName: string,
  transformProps: (props: S) => Omit<PlotProps<T>, 'data'> & PlotParams
) {
  function PlotlyPlotComponent(props: S, ref: Ref<PlotRef>) {
    const xformProps = transformProps(props);
    return <PlotlyPlotWithRef {...xformProps} ref={ref} />;
  }
  PlotlyPlotComponent.displayName = displayName;
  return forwardRef(PlotlyPlotComponent);
}

export default PlotlyPlotWithRef;
