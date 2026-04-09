import {
  CSSProperties,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  VolcanoPlotData,
  VolcanoPlotDataPoint,
  VolcanoPlotStats,
} from '../types/plots/volcanoplot';
import { NumberRange } from '../types/general';
import {
  SignificanceColors,
  significanceColors,
  PlotRef,
} from '../types/plots';
import {
  XYChart,
  Axis,
  Grid,
  GlyphSeries,
  Annotation,
  AnnotationLineSubject,
  DataContext,
  AnnotationLabel,
  Tooltip,
} from '@visx/xychart';
import { Group } from '@visx/group';
import {
  gridStyles,
  thresholdLineStyles,
  VisxPoint,
  axisStyles,
  plotToImage,
} from './visxVEuPathDB';
import { Polygon } from '@visx/shape';
import { useContext } from 'react';
import { PatternLines } from '@visx/pattern';
import Spinner from '../components/Spinner';
// For screenshotting
import { ToImgopts } from 'plotly.js';
import { DEFAULT_CONTAINER_HEIGHT } from './PlotlyPlot';
import { truncateWithEllipsis } from '../utils/axis-tick-label-ellipsis';
import { ExportPlotToImageButton } from './ExportPlotToImageButton';
import { FindNearestDatumXYProvider } from './FindNearestDatumXYProvider';
import './VolcanoPlot.css';

export interface RawDataMinMaxValues {
  x: NumberRange;
  y: NumberRange;
}

export interface StatisticsFloors {
  /** The minimum allowed p value. Useful for protecting the plot against taking the log of pvalue=0. Points with true pvalue <= pValueFloor will get plotted at -log10(pValueFloor).
   * Any points with pvalue <= the pValueFloor will show "P Value <= {pValueFloor}" in the tooltip.
   */
  pValueFloor: number;
  /** The minimum allowed adjusted p value. Ideally should be calculated in conjunction with the pValueFloor. Currently used
   * only to update the tooltip with this information, but later will be used to control the y axis location, similar to pValueFloor.
   */
  adjustedPValueFloor?: number;
}

export interface VolcanoPlotProps {
  /** Data for the plot. An effectSizeLabel and an array of VolcanoPlotDataPoints */
  data: VolcanoPlotData | undefined;
  /**
   * Used to set the fold change thresholds. Will
   * set two thresholds at +/- this number. Affects point colors
   */
  effectSizeThreshold: number;
  /** Set the threshold for significance. Affects point colors */
  significanceThreshold: number;
  /** x-axis range  */
  independentAxisRange?: NumberRange;
  /** y-axis range */
  dependentAxisRange?: NumberRange;
  /**
   * Array of size 2 that contains a label for the left and right side
   * of the x axis (in that order). Expect this to be passed by the viz based
   * on the type of data we're using (genes vs taxa vs etc.)
   */
  comparisonLabels?: Array<string>;
  /** Title of the plot */
  plotTitle?: string;
  /** marker fill opacity: range from 0 to 1 */
  markerBodyOpacity: number;
  /** Truncation bar fill color. If no color provided, truncation bars will be filled with a black and white pattern */
  truncationBarFill?: string;
  /** container name */
  containerClass?: string;
  /** styling for the plot's container */
  containerStyles?: CSSProperties;
  /** shall we show the loading spinner? */
  showSpinner?: boolean;
  /** used to determine truncation logic */
  rawDataMinMaxValues: RawDataMinMaxValues;
  /** Minimum (floor) values for p values and adjusted p values. Will set a cap on the maximum y axis values
   * at which points can be plotted. This information will also be shown in tooltips for floored points.
   */
  statisticsFloors?: StatisticsFloors;
  /** Controls which directions of effect are highlighted. 'up only' hides the negative threshold line;
   * 'down only' hides the positive threshold line. Defaults to 'up and down'. */
  effectDirection?: 'up and down' | 'up only' | 'down only';
}

const EmptyVolcanoPlotStats: VolcanoPlotStats = [];

const EmptyVolcanoPlotData: VolcanoPlotData = {
  effectSizeLabel: 'log2(FoldChange)',
  statistics: EmptyVolcanoPlotStats,
};

export const DefaultStatisticsFloors: StatisticsFloors = {
  pValueFloor: 0, // Do not floor by default
};

const MARGIN_DEFAULT = 50;

interface TruncationRectangleProps {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  fill: string;
}

// MUST be used within a visx DataProvider component because it
// relies on the DataContext to give plot scales
function TruncationRectangle(props: TruncationRectangleProps) {
  const { x1, x2, y1, y2, fill } = props;
  const { xScale, yScale } = useContext(DataContext);

  return xScale && yScale ? (
    <Polygon
      points={[
        [Number(xScale(x1)), Number(yScale(y1))],
        [Number(xScale(x2)), Number(yScale(y1))],
        [Number(xScale(x2)), Number(yScale(y2))],
        [Number(xScale(x1)), Number(yScale(y2))],
      ]}
      fill={fill}
    />
  ) : (
    <></>
  );
}

interface PinnedTooltipProps {
  datum: VolcanoPlotDataPoint;
  x: number;
  y: number;
  effectSizeLabel: string;
  statisticsFloors: StatisticsFloors;
  onClose: () => void;
}

const PinnedTooltip = forwardRef<HTMLDivElement, PinnedTooltipProps>(
  function PinnedTooltip(
    { datum, x, y, effectSizeLabel, statisticsFloors, onClose },
    ref
  ) {
    const color =
      datum.significanceColor === significanceColors['inconclusive']
        ? 'black'
        : 'white';

    return (
      <div
        ref={ref}
        className="VolcanoPlotPinnedTooltip"
        onClick={(e) => e.stopPropagation()}
        style={{
          left: x,
          top: y,
          color,
          background: datum.significanceColor,
        }}
      >
        <button
          type="button"
          className="VolcanoPlotPinnedTooltip__close-btn"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          style={{ color }}
          aria-label="Dismiss pinned tooltip"
        >
          &times;
        </button>
        <TooltipBody
          datum={datum}
          effectSizeLabel={effectSizeLabel}
          statisticsFloors={statisticsFloors}
          color={color}
          showCopyButtons
        />
      </div>
    );
  }
);

/**
 * The Volcano Plot displays points on a (magnitude change) by (significance) xy axis.
 * The standard volcano plot has -log2(Fold Change) as the x axis and -log10(raw p value)
 * on the y axis. The volcano plot also colors the points based on their
 * significance and magnitude change to make it easy to spot significantly up or down-regulated genes or taxa.
 */
function VolcanoPlot(props: VolcanoPlotProps, ref: Ref<PlotRef>) {
  const {
    data = EmptyVolcanoPlotData,
    independentAxisRange,
    dependentAxisRange,
    significanceThreshold,
    effectSizeThreshold,
    markerBodyOpacity,
    containerClass = 'web-components-plot',
    containerStyles = { width: '100%', height: DEFAULT_CONTAINER_HEIGHT },
    comparisonLabels,
    truncationBarFill,
    showSpinner = false,
    rawDataMinMaxValues,
    statisticsFloors = DefaultStatisticsFloors,
    effectDirection = 'up and down',
  } = props;

  // Use ref forwarding to enable screenshotting of the plot for thumbnail versions.
  const plotRef = useRef<HTMLDivElement>(null);

  // When containerStyles provides numeric pixel dimensions, pass them directly to
  // XYChart so it skips ParentSize/ResizeObserver entirely. This prevents the
  // "XYChart has a zero width or height" warning that fires when the container is
  // measured before the browser has laid it out (e.g. inside a collapsible panel).
  const chartWidth =
    typeof containerStyles.width === 'number'
      ? containerStyles.width
      : undefined;
  const chartHeight =
    typeof containerStyles.height === 'number'
      ? containerStyles.height
      : undefined;

  const toImage = useCallback(async (imgOpts: ToImgopts) => {
    return plotToImage(plotRef.current, imgOpts);
  }, []);

  useImperativeHandle<PlotRef, PlotRef>(
    ref,
    () => ({
      // The thumbnail generator makePlotThumbnailUrl expects to call a toImage function
      toImage,
    }),
    [toImage]
  );

  // Pinned tooltip state
  const [pinnedDatum, setPinnedDatum] = useState<{
    datum: VolcanoPlotDataPoint;
    x: number;
    y: number;
  } | null>(null);
  const pinnedTooltipRef = useRef<HTMLDivElement>(null);

  // Dismiss pinned tooltip on click-away
  // Dismiss pinned tooltip on click-away (outside both the tooltip and the plot)
  useEffect(() => {
    if (!pinnedDatum) return;
    function handleClickAway(e: MouseEvent) {
      const target = e.target as Node;
      // Ignore clicks inside the pinned tooltip or the plot area —
      // the plot's own onClick handles pin/dismiss within the plot.
      if (pinnedTooltipRef.current?.contains(target)) return;
      if (plotRef.current?.contains(target)) return;
      setPinnedDatum(null);
    }
    // Delay listener so the click that pinned doesn't immediately dismiss
    const timeout = setTimeout(
      () => document.addEventListener('pointerdown', handleClickAway),
      0
    );
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('pointerdown', handleClickAway);
    };
  }, [pinnedDatum]);

  const effectSizeLabel = data.effectSizeLabel;

  // Set maxes and mins of the data itself from rawDataMinMaxValues prop
  const { min: dataXMin, max: dataXMax } = rawDataMinMaxValues.x;
  const { min: dataYMin, max: dataYMax } = rawDataMinMaxValues.y;

  // When dataYMin = 0, there must be a point with pvalue = 0, which means the plot will try in vain to draw a point at -log10(0) = Inf.
  // When this issue arises, one should set a pValueFloor >= 0 so that the point with pValue = 0
  // will be able to be plotted sensibly.
  if (dataYMin === 0 && statisticsFloors.pValueFloor <= 0) {
    throw new Error(
      'Found data point with pValue = 0. Cannot create a volcano plot with a point at -log10(0) = Inf. Please use the statisticsFloors prop to set a pValueFloor >= 0.'
    );
  }

  // Set mins, maxes of axes in the plot using axis range props
  // The y axis max should not be allowed to exceed -log10(pValueFloor)
  const xAxisMin = independentAxisRange?.min ?? 0;
  const xAxisMax = independentAxisRange?.max ?? 0;
  const yAxisMin = dependentAxisRange?.min ?? 0;
  const yAxisMax = dependentAxisRange?.max
    ? dependentAxisRange.max > -Math.log10(statisticsFloors.pValueFloor)
      ? -Math.log10(statisticsFloors.pValueFloor)
      : dependentAxisRange.max
    : 0;

  // Do we need to show the special annotation for the case when the y axis is maxxed out?
  const showFlooredDataAnnotation =
    yAxisMax === -Math.log10(statisticsFloors.pValueFloor);

  // Truncation indicators
  // If we have truncation indicators, we'll need to expand the plot range just a tad to
  // ensure the truncation bars appear. The folowing showTruncationBar variables will
  // be either 0 (do not show bar) or 1 (show bar).
  // The y axis has special logic because it gets capped at -log10(pValueFloor) and we dont want to
  // show the truncation bar if the annotation will be shown!
  const showXMinTruncationBar = Number(dataXMin < xAxisMin);
  const showXMaxTruncationBar = Number(dataXMax > xAxisMax);
  const xTruncationBarWidth = 0.02 * (xAxisMax - xAxisMin);

  const showYMinTruncationBar = Number(-Math.log10(dataYMax) < yAxisMin);
  const showYMaxTruncationBar = Number(
    -Math.log10(dataYMin) > yAxisMax && !showFlooredDataAnnotation
  );
  const yTruncationBarHeight = 0.02 * (yAxisMax - yAxisMin);

  /**
   * Check whether each threshold line is within the graph's axis ranges so we can
   * prevent the line from rendering outside the graph.
   */
  const showNegativeFoldChangeThresholdLine =
    effectDirection !== 'up only' && -effectSizeThreshold > xAxisMin;
  const showPositiveFoldChangeThresholdLine =
    effectDirection !== 'down only' && effectSizeThreshold < xAxisMax;
  const showSignificanceThresholdLine =
    -Math.log10(Number(significanceThreshold)) > yAxisMin &&
    -Math.log10(Number(significanceThreshold)) < yAxisMax;

  /**
   * Accessors - tell visx which value of the data point we should use and where.
   */

  // For the actual volcano plot data. Y axis points are capped at -Math.log10(pValueFloor)
  const dataAccessors = {
    xAccessor: (d: VolcanoPlotDataPoint) => Number(d?.effectSize),
    yAccessor: (d: VolcanoPlotDataPoint) =>
      Number(d.pValue) <= statisticsFloors.pValueFloor
        ? -Math.log10(statisticsFloors.pValueFloor)
        : -Math.log10(Number(d?.pValue)),
  };

  // For all other situations where we need to access point values. For example
  // threshold lines and annotations.
  const xyAccessors = {
    xAccessor: (d: VisxPoint) => {
      return d?.x;
    },
    yAccessor: (d: VisxPoint) => {
      return d?.y;
    },
  };

  // Handle click-to-pin: find nearest datum using Euclidean distance in SVG space
  const handlePlotClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const svg = plotRef.current?.querySelector('svg');
      if (!svg) return;

      // Convert client coords to SVG coords
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgPoint = point.matrixTransform(ctm.inverse());

      // Find nearest datum by Euclidean distance using the same accessors as the chart
      // We need to convert data values to the same SVG pixel space.
      // XYChart renders an inner svg, so we read scales from the rendered axes.
      // Simpler: we can read the viewBox / dimensions and build a linear scale ourselves.
      // But even simpler: visx XYChart exposes scales via DataContext — however we're
      // outside the XYChart here. Instead, we can compute pixel positions from the
      // SVG's own coordinate system by reading the axis tick positions...
      //
      // Actually the simplest reliable approach: the SVG rendered by XYChart has known
      // margins and domains. We can map data coords to SVG coords using linear interpolation.
      const svgWidth = svg.clientWidth || svg.getBoundingClientRect().width;
      const svgHeight = svg.clientHeight || svg.getBoundingClientRect().height;
      const marginLeft = MARGIN_DEFAULT + 10;
      const marginRight = showFlooredDataAnnotation ? 150 : MARGIN_DEFAULT + 10;
      const marginTop = MARGIN_DEFAULT;
      const marginBottom = MARGIN_DEFAULT + 20;
      const plotWidth = svgWidth - marginLeft - marginRight;
      const plotHeight = svgHeight - marginTop - marginBottom;

      const xDomainMin = xAxisMin - showXMinTruncationBar * xTruncationBarWidth;
      const xDomainMax = xAxisMax + showXMaxTruncationBar * xTruncationBarWidth;
      const yDomainMin =
        yAxisMin - showYMinTruncationBar * yTruncationBarHeight;
      const yDomainMax =
        yAxisMax + showYMaxTruncationBar * yTruncationBarHeight;

      function toSvgX(val: number) {
        return (
          marginLeft +
          ((val - xDomainMin) / (xDomainMax - xDomainMin)) * plotWidth
        );
      }
      function toSvgY(val: number) {
        // y axis is inverted: higher data values -> lower SVG y
        return (
          marginTop +
          ((yDomainMax - val) / (yDomainMax - yDomainMin)) * plotHeight
        );
      }

      let nearestDatum: VolcanoPlotDataPoint | null = null;
      let nearestDistSq = Infinity;

      for (const d of data.statistics) {
        const px = toSvgX(dataAccessors.xAccessor(d));
        const py = toSvgY(dataAccessors.yAccessor(d));
        const dx = px - svgPoint.x;
        const dy = py - svgPoint.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < nearestDistSq) {
          nearestDistSq = distSq;
          nearestDatum = d;
        }
      }

      // Only pin if click is within 20px of the nearest point; otherwise dismiss
      const MAX_PIN_DISTANCE = 20;
      if (
        nearestDatum &&
        nearestDistSq <= MAX_PIN_DISTANCE * MAX_PIN_DISTANCE
      ) {
        setPinnedDatum({
          datum: nearestDatum,
          x: svgPoint.x,
          y: svgPoint.y,
        });
      } else {
        setPinnedDatum(null);
      }
    },
    [
      data.statistics,
      dataAccessors,
      xAxisMin,
      xAxisMax,
      yAxisMin,
      yAxisMax,
      showXMinTruncationBar,
      showXMaxTruncationBar,
      showYMinTruncationBar,
      showYMaxTruncationBar,
      xTruncationBarWidth,
      yTruncationBarHeight,
      showFlooredDataAnnotation,
    ]
  );

  // Relative positioning so that tooltips are positioned correctly (tooltips are positioned absolutely)
  return (
    <>
      <div
        className={containerClass}
        style={{ ...containerStyles, position: 'relative' }}
      >
        <div
          ref={plotRef} // Set ref here. Also tried setting innerRef of Group but that didnt work with domToImage
          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
          onClick={handlePlotClick}
        >
          {/* The XYChart takes care of laying out the chart elements (children) appropriately. 
          It uses modularized React.context layers for data, events, etc. The following all becomes an svg,
          so use caution when ordering the children (ex. draw axes before data).  */}
          <XYChart
            width={chartWidth}
            height={chartHeight}
            xScale={{
              type: 'linear',
              // showTruncationBar vars are 0 or 1, so we only expand the x axis by xTruncationBarWidth when a bar will be drawn
              domain: [
                xAxisMin - showXMinTruncationBar * xTruncationBarWidth,
                xAxisMax + showXMaxTruncationBar * xTruncationBarWidth,
              ],
              zero: false,
            }}
            yScale={{
              type: 'linear',
              // showTruncationBar vars are 0 or 1, so we only expand the y axis by yTruncationBarHeight when a bar will be drawn
              domain: [
                yAxisMin - showYMinTruncationBar * yTruncationBarHeight,
                yAxisMax + showYMaxTruncationBar * yTruncationBarHeight,
              ],
              zero: false,
            }}
            margin={{
              top: MARGIN_DEFAULT,
              right: showFlooredDataAnnotation ? 150 : MARGIN_DEFAULT + 10,
              left: MARGIN_DEFAULT + 10, // Bottom annotatiions get wide (for right margin, too)
              bottom: MARGIN_DEFAULT + 20, // Bottom annotations can get long
            }}
          >
            <FindNearestDatumXYProvider>
              {/* Set up the axes and grid lines. XYChart magically lays them out correctly */}
              <Grid numTicks={6} lineStyle={gridStyles} />
              <Axis
                orientation="left"
                label="-log10 Raw P Value"
                {...axisStyles}
              />
              <Axis
                orientation="bottom"
                label={effectSizeLabel}
                {...axisStyles}
              />

              {/* X axis annotations */}
              {comparisonLabels &&
                comparisonLabels.map((label, ind) => {
                  return (
                    <Annotation
                      key={ind}
                      datum={{
                        x: [xAxisMin, xAxisMax][ind], // Labels go at extremes of x axis
                        y:
                          yAxisMin -
                          showYMinTruncationBar * yTruncationBarHeight,
                      }}
                      dx={0}
                      dy={-15}
                      {...xyAccessors}
                    >
                      <AnnotationLabel
                        subtitle={truncateWithEllipsis(label, 30)}
                        horizontalAnchor="middle"
                        verticalAnchor="start"
                        showAnchorLine={false}
                        showBackground={false}
                        maxWidth={100}
                      />
                    </Annotation>
                  );
                })}

              {/* Draw threshold lines as annotations below the data points. The
          annotations use XYChart's theme and dimension context.
          The Annotation component holds the context for its children, which is why
          we make a new Annotation component for each line.
          Another option would be to make Line with LineSeries, but the default hover response
          is on the points instead of the line connecting them. */}

              {/* Draw horizontal significance threshold */}
              {significanceThreshold && showSignificanceThresholdLine && (
                <Annotation
                  datum={{
                    x: 0, // horizontal line so x could be anything
                    y: -Math.log10(Number(significanceThreshold)),
                  }}
                  {...xyAccessors}
                >
                  <AnnotationLineSubject
                    orientation="horizontal"
                    {...thresholdLineStyles}
                  />
                </Annotation>
              )}
              {/* Draw both vertical effect size threshold lines */}
              {effectSizeThreshold && (
                <>
                  {showNegativeFoldChangeThresholdLine && (
                    <Annotation
                      datum={{
                        x: -effectSizeThreshold,
                        y: 0, // vertical line so y could be anything
                      }}
                      {...xyAccessors}
                    >
                      <AnnotationLineSubject {...thresholdLineStyles} />
                    </Annotation>
                  )}
                  {showPositiveFoldChangeThresholdLine && (
                    <Annotation
                      datum={{
                        x: effectSizeThreshold,
                        y: 0, // vertical line so y could be anything
                      }}
                      {...xyAccessors}
                    >
                      <AnnotationLineSubject {...thresholdLineStyles} />
                    </Annotation>
                  )}
                </>
              )}

              {/* infinity y data annotation line */}
              {showFlooredDataAnnotation && (
                <Annotation
                  datum={{
                    x: xAxisMax,
                    y: yAxisMax + showYMaxTruncationBar * yTruncationBarHeight,
                  }}
                  {...xyAccessors}
                >
                  <AnnotationLineSubject
                    {...thresholdLineStyles}
                    orientation="horizontal"
                  />
                  <AnnotationLabel
                    title={'Values above this line are capped'}
                    titleFontWeight={200}
                    titleFontSize={12}
                    horizontalAnchor="start"
                    verticalAnchor="middle"
                    showAnchorLine={false}
                    showBackground={false}
                  />
                </Annotation>
              )}

              {/* The data itself */}
              {/* Wrapping in a group in order to change the opacity of points. The GlyphSeries is somehow
            a bunch of glyphs which are <circles> so there should be a way to pass opacity
            down to those elements, but I haven't found it yet */}
              <Group opacity={markerBodyOpacity}>
                <GlyphSeries
                  dataKey={'data'} // unique key
                  data={data.statistics}
                  {...dataAccessors}
                  colorAccessor={(d: VolcanoPlotDataPoint) =>
                    d.significanceColor
                  }
                />
              </Group>
              <Tooltip<VolcanoPlotDataPoint>
                snapTooltipToDatumX
                snapTooltipToDatumY
                showVerticalCrosshair={!pinnedDatum}
                showHorizontalCrosshair={!pinnedDatum}
                horizontalCrosshairStyle={{ stroke: 'red' }}
                verticalCrosshairStyle={{ stroke: 'red' }}
                unstyled
                applyPositionStyle
                renderTooltip={(d) => {
                  if (pinnedDatum) return null;
                  const datum = d.tooltipData?.nearestDatum?.datum;
                  if (!datum) return null;
                  const color =
                    datum.significanceColor ===
                    significanceColors['inconclusive']
                      ? 'black'
                      : 'white';
                  return (
                    <div
                      className="VolcanoPlotTooltip"
                      style={{
                        color,
                        background: datum.significanceColor,
                      }}
                    >
                      <TooltipBody
                        datum={datum}
                        effectSizeLabel={effectSizeLabel}
                        statisticsFloors={statisticsFloors}
                        color={color}
                        showHint
                      />
                    </div>
                  );
                }}
              />

              {/* Truncation indicators */}
              {/* Example from https://airbnb.io/visx/docs/pattern */}
              {!truncationBarFill && (
                <PatternLines
                  id="lines"
                  height={5}
                  width={5}
                  stroke={'black'}
                  strokeWidth={1}
                  orientation={['diagonal']}
                  background="#FFF"
                />
              )}
              {showXMinTruncationBar && (
                <TruncationRectangle
                  x1={xAxisMin - xTruncationBarWidth}
                  x2={xAxisMin}
                  y1={yAxisMin - showYMinTruncationBar * yTruncationBarHeight}
                  y2={yAxisMax + showYMaxTruncationBar * yTruncationBarHeight}
                  fill={truncationBarFill ?? "url('#lines')"}
                />
              )}
              {showXMaxTruncationBar && (
                <TruncationRectangle
                  x1={xAxisMax}
                  x2={xAxisMax + xTruncationBarWidth}
                  y1={yAxisMin - showYMinTruncationBar * yTruncationBarHeight}
                  y2={yAxisMax + showYMaxTruncationBar * yTruncationBarHeight}
                  fill={truncationBarFill ?? "url('#lines')"}
                />
              )}
              {showYMaxTruncationBar && (
                <TruncationRectangle
                  x1={xAxisMin - showXMinTruncationBar * xTruncationBarWidth}
                  x2={xAxisMax + showXMaxTruncationBar * xTruncationBarWidth}
                  y1={yAxisMax}
                  y2={yAxisMax + yTruncationBarHeight}
                  fill={truncationBarFill ?? "url('#lines')"}
                />
              )}
              {showYMinTruncationBar && (
                <TruncationRectangle
                  x1={xAxisMin - showXMinTruncationBar * xTruncationBarWidth}
                  x2={xAxisMax + showXMaxTruncationBar * xTruncationBarWidth}
                  y1={yAxisMin - yTruncationBarHeight}
                  y2={yAxisMin}
                  fill={truncationBarFill ?? "url('#lines')"}
                />
              )}
            </FindNearestDatumXYProvider>
          </XYChart>
          {showSpinner && <Spinner />}
          {pinnedDatum && (
            <PinnedTooltip
              ref={pinnedTooltipRef}
              datum={pinnedDatum.datum}
              x={pinnedDatum.x}
              y={pinnedDatum.y}
              effectSizeLabel={effectSizeLabel}
              statisticsFloors={statisticsFloors}
              onClose={() => setPinnedDatum(null)}
            />
          )}
        </div>
      </div>
      <ExportPlotToImageButton toImage={toImage} filename="Volcano" />
    </>
  );
}

interface TooltipBodyProps {
  datum: VolcanoPlotDataPoint;
  effectSizeLabel: string;
  statisticsFloors: StatisticsFloors;
  color: string;
  /** Show per-label copy-to-clipboard buttons (pinned tooltip) */
  showCopyButtons?: boolean;
  /** Show "Click point to pin & copy" hint (hover tooltip) */
  showHint?: boolean;
}

function TooltipBody({
  datum,
  effectSizeLabel,
  statisticsFloors,
  color,
  showCopyButtons = false,
  showHint = false,
}: TooltipBodyProps) {
  const [copied, setCopied] = useState(false);
  const labels = datum.displayLabels ?? datum.pointIDs ?? [];
  const labelText = labels.join(', ');

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigator.clipboard.writeText(labelText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [labelText]
  );

  return (
    <>
      <ul>
        {labels.map((label) => (
          <li key={label}>
            <span>{label}</span>
            {showCopyButtons && (
              <button
                type="button"
                className="VolcanoPlotPinnedTooltip__copy-btn"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
      <div
        className="pseudo-hr"
        style={{ borderBottom: `1px solid ${color}` }}
      ></div>
      <ul>
        <li>
          <span>{effectSizeLabel}:</span> {datum.effectSize}
        </li>
        <li>
          <span>P Value:</span>{' '}
          {datum.pValue
            ? Number(datum.pValue) <= statisticsFloors.pValueFloor
              ? '<= ' + statisticsFloors.pValueFloor
              : datum.pValue
            : 'n/a'}
        </li>
        <li>
          <span>Adjusted P Value:</span>{' '}
          {datum.adjustedPValue
            ? statisticsFloors.adjustedPValueFloor &&
              Number(datum.adjustedPValue) <=
                statisticsFloors.adjustedPValueFloor &&
              Number(datum.pValue) <= statisticsFloors.pValueFloor
              ? '<= ' + statisticsFloors.adjustedPValueFloor
              : datum.adjustedPValue
            : 'n/a'}
        </li>
      </ul>
      {showHint && (
        <div className="VolcanoPlotTooltip__hint">
          Click point to pin &amp; copy
        </div>
      )}
    </>
  );
}

/**
 * Assign color to point based on significance and magnitude change thresholds
 */
export function assignSignificanceColor(
  effectSize: number,
  pValue: number,
  significanceThreshold: number,
  effectSizeThreshold: number,
  significanceColors: SignificanceColors
) {
  // Test 1. If the y value is higher than the significance threshold, just return not significant
  if (pValue >= significanceThreshold) {
    return significanceColors['inconclusive'];
  }

  // Test 2. So the y is significant. Is the x larger than the positive foldChange threshold?
  if (effectSize >= effectSizeThreshold) {
    return significanceColors['high'];
  }

  // Test 3. Is the x value lower than the negative foldChange threshold?
  if (effectSize <= -effectSizeThreshold) {
    return significanceColors['low'];
  }

  // If we're still here, it must be a non significant point.
  return significanceColors['inconclusive'];
}

export default forwardRef(VolcanoPlot);
