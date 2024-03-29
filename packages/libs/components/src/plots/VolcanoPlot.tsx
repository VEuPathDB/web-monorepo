import {
  CSSProperties,
  forwardRef,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  VolcanoPlotData,
  VolcanoPlotDataPoint,
  VolcanoPlotStats,
} from '../types/plots/volcanoplot';
import { NumberRange } from '../types/general';
import { SignificanceColors, significanceColors } from '../types/plots';
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
import findNearestDatumXY from '@visx/xychart/lib/utils/findNearestDatumXY';
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
import { PatternLines } from '@visx/visx';
import Spinner from '../components/Spinner';
// For screenshotting
import { ToImgopts } from 'plotly.js';
import { DEFAULT_CONTAINER_HEIGHT } from './PlotlyPlot';
import { truncateWithEllipsis } from '../utils/axis-tick-label-ellipsis';
import { ExportPlotToImageButton } from './ExportPlotToImageButton';
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
}

const EmptyVolcanoPlotStats: VolcanoPlotStats = [
  { effectSize: '0', pValue: '1' },
];

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

/**
 * The Volcano Plot displays points on a (magnitude change) by (significance) xy axis.
 * The standard volcano plot has -log2(Fold Change) as the x axis and -log10(raw p value)
 * on the y axis. The volcano plot also colors the points based on their
 * significance and magnitude change to make it easy to spot significantly up or down-regulated genes or taxa.
 */
function VolcanoPlot(props: VolcanoPlotProps, ref: Ref<HTMLDivElement>) {
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
  } = props;

  // Use ref forwarding to enable screenshotting of the plot for thumbnail versions.
  const plotRef = useRef<HTMLDivElement>(null);

  const toImage = useCallback(async (imgOpts: ToImgopts) => {
    return plotToImage(plotRef.current, imgOpts);
  }, []);

  useImperativeHandle<HTMLDivElement, any>(
    ref,
    () => ({
      // The thumbnail generator makePlotThumbnailUrl expects to call a toImage function
      toImage,
    }),
    [toImage]
  );

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
  const showNegativeFoldChangeThresholdLine = -effectSizeThreshold > xAxisMin;
  const showPositiveFoldChangeThresholdLine = effectSizeThreshold < xAxisMax;
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

  // Relative positioning so that tooltips are positioned correctly (tooltips are positioned absolutely)
  return (
    <>
      <div
        className={containerClass}
        style={{ ...containerStyles, position: 'relative' }}
      >
        <div
          ref={plotRef} // Set ref here. Also tried setting innerRef of Group but that didnt work with domToImage
          style={{ width: '100%', height: '100%' }}
        >
          {/* The XYChart takes care of laying out the chart elements (children) appropriately. 
          It uses modularized React.context layers for data, events, etc. The following all becomes an svg,
          so use caution when ordering the children (ex. draw axes before data).  */}
          <XYChart
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
            findNearestDatumOverride={findNearestDatumXY}
            margin={{
              top: MARGIN_DEFAULT,
              right: showFlooredDataAnnotation ? 150 : MARGIN_DEFAULT + 10,
              left: MARGIN_DEFAULT + 10, // Bottom annotatiions get wide (for right margin, too)
              bottom: MARGIN_DEFAULT + 20, // Bottom annotations can get long
            }}
          >
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
                    datum={{
                      x: [xAxisMin, xAxisMax][ind], // Labels go at extremes of x axis
                      y:
                        yAxisMin - showYMinTruncationBar * yTruncationBarHeight,
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
                colorAccessor={(d: VolcanoPlotDataPoint) => d.significanceColor}
                findNearestDatumOverride={findNearestDatumXY}
              />
            </Group>
            <Tooltip<VolcanoPlotDataPoint>
              snapTooltipToDatumX
              snapTooltipToDatumY
              showVerticalCrosshair
              showHorizontalCrosshair
              horizontalCrosshairStyle={{ stroke: 'red' }}
              verticalCrosshairStyle={{ stroke: 'red' }}
              unstyled
              applyPositionStyle
              renderTooltip={(d) => {
                const data = d.tooltipData?.nearestDatum?.datum;
                /**
                 * Notes regarding colors in the tooltips:
                 *  1. We use the data point's significanceColor property for background color
                 *  2. For color contrast reasons, color for text and hr's border is set conditionally:
                 *      - if significanceColor matches the 'inconclusive' color (grey), we use black
                 *      - else, we use white
                 *   (white font meets contrast ratio threshold (min 3:1 for UI-y things) w/ #AC3B4E (red) and #0E8FAB (blue))
                 */
                const color =
                  data?.significanceColor === significanceColors['inconclusive']
                    ? 'black'
                    : 'white';
                return (
                  <div
                    className="VolcanoPlotTooltip"
                    style={{
                      color,
                      background: data?.significanceColor,
                    }}
                  >
                    <ul>
                      {data?.displayLabels
                        ? data.displayLabels.map((label) => (
                            <li key={label}>
                              <span>{label}</span>
                            </li>
                          ))
                        : data?.pointIDs?.map((id) => (
                            <li key={id}>
                              <span>{id}</span>
                            </li>
                          ))}
                    </ul>
                    <div
                      className="pseudo-hr"
                      style={{ borderBottom: `1px solid ${color}` }}
                    ></div>
                    <ul>
                      <li>
                        <span>{effectSizeLabel}:</span> {data?.effectSize}
                      </li>
                      <li>
                        <span>P Value:</span>{' '}
                        {data?.pValue
                          ? Number(data.pValue) <= statisticsFloors.pValueFloor
                            ? '<= ' + statisticsFloors.pValueFloor
                            : data?.pValue
                          : 'n/a'}
                      </li>
                      <li>
                        <span>Adjusted P Value:</span>{' '}
                        {data?.adjustedPValue
                          ? statisticsFloors.adjustedPValueFloor &&
                            Number(data.adjustedPValue) <=
                              statisticsFloors.adjustedPValueFloor &&
                            Number(data.pValue) <= statisticsFloors.pValueFloor
                            ? '<= ' + statisticsFloors.adjustedPValueFloor
                            : data?.adjustedPValue
                          : 'n/a'}
                      </li>
                    </ul>
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
          </XYChart>
          {showSpinner && <Spinner />}
        </div>
      </div>
      <ExportPlotToImageButton toImage={toImage} filename="Volcano" />
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
