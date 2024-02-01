import React, {
  CSSProperties,
  Ref,
  Suspense,
  forwardRef,
  lazy,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import { PlotParams } from 'react-plotly.js';
import { legendSpecification } from '../utils/plotly';
import Spinner from '../components/Spinner';
import { PlotRef } from '../types/plots';
import {
  PlotLegendAddon,
  PlotSpacingAddon,
  PlotSpacingDefault,
  ColorPaletteAddon,
  ColorPaletteDefault,
} from '../types/plots/addOns';
// add d3.select
import { select } from 'd3';
// 3rd party toImage function from plotly
import Plotly, { ToImgopts, DataTitle } from 'plotly.js';
import { uniqueId } from 'lodash';
import { makeSharedPromise } from '../utils/promise-utils';
import NoDataOverlay from '../components/NoDataOverlay';
import { removeHtmlTags } from '../utils/removeHtmlTags';
import { ExportPlotToImageButton } from './ExportPlotToImageButton';

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
  /** Show an overlay with the words 'No Data' */
  showNoDataOverlay?: boolean;
  /** Show "Export to SVG" button */
  showExportButton?: boolean;
  /** Filename of exported file, without extension. */
  exportFileName?: string;
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
  /** list of checked legend items via checkbox input */
  checkedLegendItems?: string[];
  /** A function to call each time after plotly renders the plot */
  onPlotlyRender?: PlotParams['onUpdate'];
}

const Plot = lazy(() => import('react-plotly.js'));

export const DEFAULT_CONTAINER_HEIGHT = '400px';
export const DEFAULT_MAX_LEGEND_TEXT_LENGTH = 20;

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
    containerStyles = { width: '100%', height: DEFAULT_CONTAINER_HEIGHT },
    containerClass = 'web-components-plot',
    interactive = false,
    displayLibraryControls,
    legendOptions,
    legendTitle,
    spacingOptions,
    showSpinner,
    showNoDataOverlay,
    showExportButton,
    exportFileName,
    // set default max number of characters (20) for legend ellipsis
    maxLegendTextLength = DEFAULT_MAX_LEGEND_TEXT_LENGTH,
    // expose data for applying legend ellipsis
    data,
    // original independent axis tick labels for tooltip text
    storedIndependentAxisTickLabel,
    checkedLegendItems,
    colorPalette = ColorPaletteDefault,
    onPlotlyRender,
    ...plotlyProps
  } = props;

  // set max legend title length for ellipsis
  const maxLegendTitleTextLength = maxLegendTextLength + 5;
  // set max independent axis title length for ellipsis
  const maxIndependentAxisTitleTextLength = 60;
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

  const xAxisTitle = plotlyProps?.layout?.xaxis?.title;
  const yAxisTitle = plotlyProps?.layout?.yaxis?.title;

  const finalLayout = useMemo(
    (): PlotParams['layout'] => ({
      ...plotlyProps.layout,
      xaxis: {
        linecolor: 'black',
        ...plotlyProps.layout.xaxis,
        fixedrange: true,
        linewidth: 1,
        title: axisTitleEllipsis(xAxisTitle, maxIndependentAxisTitleTextLength),
      },
      yaxis: {
        linecolor: 'black',
        ...plotlyProps.layout.yaxis,
        fixedrange: true,
        linewidth: 1,
        title: axisTitleEllipsis(yAxisTitle, maxDependentAxisTitleTextLength),
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

  // keep independent axis title for tooltip text
  const originalIndependentAxisTitle = useMemo(() => {
    if (typeof xAxisTitle === 'object' && xAxisTitle != null)
      return xAxisTitle.text;
    else return xAxisTitle;
  }, [xAxisTitle]);

  const originalDependentAxisTitle = useMemo(() => {
    if (typeof yAxisTitle === 'object' && yAxisTitle != null)
      return yAxisTitle.text;
    else return yAxisTitle;
  }, [yAxisTitle]);

  // ellipsis with tooltip for legend, legend title, and independent axis tick labels
  const onRender = useCallback(
    (figure, graphDiv: Readonly<HTMLElement>) => {
      onPlotlyRender && onPlotlyRender(figure, graphDiv);
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
          return removeHtmlTags(storedLegendList[d[0].trace.index]);
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
          .text(removeHtmlTags(legendTitle));
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
              ? removeHtmlTags(storedIndependentAxisTickLabel[i] as string)
              : '';
          });
      }

      // handling independent axis title with ellipsis & tooltip
      if (
        originalIndependentAxisTitle != null &&
        (originalIndependentAxisTitle as string).length >
          maxIndependentAxisTitleTextLength
      ) {
        // remove duplicate svg:title
        select(graphDiv)
          .select('.plot-container svg.main-svg g.infolayer g.g-xtitle')
          .selectAll('title')
          .remove();

        // add tooltip
        select(graphDiv)
          .select(
            '.plot-container svg.main-svg g.infolayer g.g-xtitle text.xtitle'
          )
          // need this attribute for tooltip of dependent axis title!
          .attr('pointer-events', 'all')
          .append('svg:title')
          .text(
            removeHtmlTags(originalIndependentAxisTitle as string) as string
          );
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
          .text(removeHtmlTags(originalDependentAxisTitle as string) as string);
      }
    },
    [
      onPlotlyRender,
      storedLegendList,
      legendTitle,
      maxLegendTitleTextLength,
      storedIndependentAxisTickLabel,
      originalDependentAxisTitle,
    ]
  );

  const onInitialized = useCallback(
    (figure, graphDiv: Readonly<HTMLElement>) => {
      onRender(figure, graphDiv);
      sharedPlotCreation.run();
    },
    [onRender, sharedPlotCreation.run]
  );

  const finalData = useMemo(() => {
    return data.map((d: any) => ({
      ...d,
      // set to 'legendonly' as 'true' changes plot colors and condition for no custom legend case
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
  }, [data, checkedLegendItems, maxLegendTextLength]);

  const plotId = useMemo(() => uniqueId('plotly_plot_div_'), []);

  const toImage = useCallback(
    async (imageOpts: ToImgopts) => {
      try {
        await sharedPlotCreation.promise;
        // Call the 3rd party function that actually creates the image
        return await Plotly.toImage(plotId, imageOpts);
      } catch (error) {
        console.error('Could not create image for plot:', error);
      }
      return '';
    },
    [plotId, sharedPlotCreation.promise]
  );

  useImperativeHandle<PlotRef, PlotRef>(
    ref,
    () => ({
      // Set the ref's toImage function that will be called in web-eda
      toImage,
    }),
    [toImage]
  );

  const marginTop = spacingOptions?.marginTop ?? PlotSpacingDefault.marginTop;

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
          onUpdate={onRender}
          onInitialized={onInitialized}
        />
        {showNoDataOverlay && (
          <NoDataOverlay plotTitle={title} opacity={0.85} />
        )}
        {title && (
          <div
            style={{
              position: 'absolute',
              top: marginTop / 3,
              left: '10%',
              fontSize: 17,
              fontStyle: title === 'No data' ? 'italic' : 'normal',
            }}
          >
            {title}
          </div>
        )}
        {showSpinner && <Spinner />}
      </div>
      {showExportButton && (
        <ExportPlotToImageButton toImage={toImage} filename={exportFileName} />
      )}
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
    return (
      <PlotlyPlotWithRef
        exportFileName={displayName}
        {...xformProps}
        ref={ref}
      />
    );
  }
  PlotlyPlotComponent.displayName = displayName;
  return forwardRef(PlotlyPlotComponent);
}

// A function for implementing the ellipsis of the axis title
function axisTitleEllipsis(
  axisTitle: string | Partial<DataTitle> | undefined,
  axisTitleTextLength: number
) {
  return typeof axisTitle === 'object' && axisTitle != null
    ? // Mosaic case
      ((axisTitle.text as string) || '').length > axisTitleTextLength
      ? {
          text:
            ((axisTitle.text as string) || '').substring(
              0,
              axisTitleTextLength
            ) + '...',
          standoff: axisTitle.standoff,
        }
      : axisTitle
    : // general case
    ((axisTitle as string) || '').length > axisTitleTextLength
    ? ((axisTitle as string) || '').substring(0, axisTitleTextLength) + '...'
    : axisTitle;
}

export default PlotlyPlotWithRef;
