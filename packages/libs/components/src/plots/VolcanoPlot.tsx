import { significanceColors } from '../types/plots';
import {
  VolcanoPlotData,
  VolcanoPlotDataPoint,
} from '../types/plots/volcanoplot';
import { NumberRange } from '../types/general';
import {
  XYChart,
  Axis,
  Grid,
  GlyphSeries,
  Annotation,
  AnnotationLineSubject,
  AnnotationLabel,
} from '@visx/xychart';
import { Group } from '@visx/group';
import { max, min } from 'lodash';
import {
  gridStyles,
  thresholdLineStyles,
  VisxPoint,
  axisStyles,
} from './visxVEuPathDB';

export interface VolcanoPlotProps {
  /** Data for the plot. An array of VolcanoPlotDataPoints */
  data: VolcanoPlotData;
  /**
   * Used to set the fold change thresholds. Will
   * set two thresholds at +/- this number. Affects point colors
   */
  log2FoldChangeThreshold: number;
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
  markerBodyOpacity?: number;
  /** Height of plot */
  height?: number;
  /** Width of plot */
  width?: number;
}

const EmptyVolcanoPlotData: VolcanoPlotData = [];

/**
 * The Volcano Plot displays points on a (magnitude change) by (significance) xy axis.
 * The standard volcano plot has -log2(Fold Change) as the x axis and -log10(raw p value)
 * on the y axis. The volcano plot also colors the points based on their
 * significance and magnitude change to make it easy to spot significantly up or down-regulated genes or taxa.
 */
function VolcanoPlot(props: VolcanoPlotProps) {
  const {
    data = EmptyVolcanoPlotData,
    independentAxisRange, // not yet implemented - expect this to be set by user
    dependentAxisRange, // not yet implemented - expect this to be set by user
    significanceThreshold,
    log2FoldChangeThreshold,
    markerBodyOpacity,
    height,
    width,
    comparisonLabels,
  } = props;

  /**
   * Find mins and maxes of the data and for the plot.
   * The standard x axis is the log2 fold change. The standard
   * y axis is -log10 raw p value.
   */

  // Find maxes and mins of the data itself
  const dataXMin = min(data.map((d) => Number(d.log2foldChange)));
  const dataXMax = max(data.map((d) => Number(d.log2foldChange)));
  const dataYMin = min(data.map((d) => Number(d.pValue)));
  const dataYMax = max(data.map((d) => Number(d.pValue)));

  // Determine mins, maxes of axes in the plot.
  // These are different than the data mins/maxes because
  // of the log transform and the little bit of padding, or because axis ranges
  // are supplied.
  let xAxisMin: number;
  let xAxisMax: number;
  let yAxisMin: number;
  let yAxisMax: number;
  const AXIS_PADDING_FACTOR = 0.05; // The padding ensures we don't clip off part of the glyphs that represent
  // the most extreme points.

  // X axis
  if (independentAxisRange) {
    xAxisMin = independentAxisRange.min;
    xAxisMax = independentAxisRange.max;
  } else {
    if (dataXMin && dataXMax) {
      // We can use the dataMin and dataMax here because we don't have a further transform
      xAxisMin = dataXMin;
      xAxisMax = dataXMax;
      // Add a little padding to prevent clipping the glyph representing the extreme points
      xAxisMin = xAxisMin - (xAxisMax - xAxisMin) * AXIS_PADDING_FACTOR;
      xAxisMax = xAxisMax + (xAxisMax - xAxisMin) * AXIS_PADDING_FACTOR;
    } else {
      xAxisMin = 0;
      xAxisMax = 0;
    }
  }

  // Y axis
  if (dependentAxisRange) {
    yAxisMin = dependentAxisRange.min;
    yAxisMax = dependentAxisRange.max;
  } else {
    if (dataYMin && dataYMax) {
      // Standard volcano plots have -log10(raw p value) as the y axis
      yAxisMin = -Math.log10(dataYMax);
      yAxisMax = -Math.log10(dataYMin);
      // Add a little padding to prevent clipping the glyph representing the extreme points
      yAxisMin = yAxisMin - (yAxisMax - yAxisMin) * AXIS_PADDING_FACTOR;
      yAxisMax = yAxisMax + (yAxisMax - yAxisMin) * AXIS_PADDING_FACTOR;
    } else {
      yAxisMin = 0;
      yAxisMax = 0;
    }
  }

  /**
   * Accessors - tell visx which value of the data point we should use and where.
   */

  // For the actual volcano plot data
  const dataAccessors = {
    xAccessor: (d: VolcanoPlotDataPoint) => {
      return Number(d?.log2foldChange);
    },
    yAccessor: (d: VolcanoPlotDataPoint) => {
      return -Math.log10(Number(d?.pValue));
    },
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

  return (
    // Relative positioning so that tooltips are positioned correctly (tooltips are positioned absolutely)
    <div style={{ position: 'relative' }}>
      {/* The XYChart takes care of laying out the chart elements (children) appropriately. 
          It uses modularized React.context layers for data, events, etc. The following all becomes an svg,
          so use caution when ordering the children (ex. draw axes before data).  */}
      <XYChart
        height={height ?? 300}
        xScale={{
          type: 'linear',
          domain: [xAxisMin, xAxisMax],
          clamp: true, // do not render points that fall outside of the scale domain (outside of the axis range)
        }}
        yScale={{
          type: 'linear',
          domain: [yAxisMin, yAxisMax],
          zero: false,
          clamp: true, // do not render points that fall outside of the scale domain (outside of the axis range)
        }}
        width={width ?? 300}
      >
        {/* Set up the axes and grid lines. XYChart magically lays them out correctly */}
        <Grid numTicks={6} lineStyle={gridStyles} />
        <Axis orientation="left" label="-log10 Raw P Value" {...axisStyles} />
        <Axis orientation="bottom" label="log2 Fold Change" {...axisStyles} />

        {/* X axis annotations */}
        {comparisonLabels &&
          comparisonLabels.map((label, ind) => {
            return (
              <Annotation
                datum={{
                  x: [xAxisMin, xAxisMax][ind], // Labels go at extremes of x axis
                  y: yAxisMin,
                }}
                dx={0}
                dy={-15}
                {...xyAccessors}
              >
                <AnnotationLabel
                  subtitle={label}
                  horizontalAnchor="middle"
                  verticalAnchor="start"
                  showAnchorLine={false}
                  showBackground={false}
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
        {significanceThreshold && (
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
        {/* Draw both vertical log2 fold change threshold lines */}
        {log2FoldChangeThreshold && (
          <>
            <Annotation
              datum={{
                x: -log2FoldChangeThreshold,
                y: 0, // vertical line so y could be anything
              }}
              {...xyAccessors}
            >
              <AnnotationLineSubject {...thresholdLineStyles} />
            </Annotation>
            <Annotation
              datum={{
                x: log2FoldChangeThreshold,
                y: 0, // vertical line so y could be anything
              }}
              {...xyAccessors}
            >
              <AnnotationLineSubject {...thresholdLineStyles} />
            </Annotation>
          </>
        )}

        {/* The data itself */}
        {/* Wrapping in a group in order to change the opacity of points. The GlyphSeries is somehow
            a bunch of glyphs which are <circles> so there should be a way to pass opacity
            down to those elements, but I haven't found it yet */}
        <Group opacity={markerBodyOpacity ?? 1}>
          <GlyphSeries
            dataKey={'data'} // unique key
            data={data} // data as an array of obejcts (points). Accessed with dataAccessors
            {...dataAccessors}
            colorAccessor={(d) => {
              return assignSignificanceColor(
                Number(d.log2foldChange),
                Number(d.pValue),
                significanceThreshold,
                log2FoldChangeThreshold,
                significanceColors
              );
            }}
          />
        </Group>
      </XYChart>
    </div>
  );
}

/**
 * Assign color to point based on significance and magnitude change thresholds
 */
function assignSignificanceColor(
  log2foldChange: number,
  pValue: number,
  significanceThreshold: number,
  log2FoldChangeThreshold: number,
  significanceColors: string[] // Assuming the order is [insignificant, high (up regulated), low (down regulated)]
) {
  // Name indices of the significanceColors array for easier accessing.
  const INSIGNIFICANT = 0;
  const HIGH = 1;
  const LOW = 2;

  // Test 1. If the y value is higher than the significance threshold, just return not significant
  if (pValue >= significanceThreshold) {
    return significanceColors[INSIGNIFICANT];
  }

  // Test 2. So the y is significant. Is the x larger than the positive foldChange threshold?
  if (log2foldChange >= log2FoldChangeThreshold) {
    return significanceColors[HIGH];
  }

  // Test 3. Is the x value lower than the negative foldChange threshold?
  if (log2foldChange <= -log2FoldChangeThreshold) {
    return significanceColors[LOW];
  }

  // If we're still here, it must be a non significant point.
  return significanceColors[INSIGNIFICANT];
}

export default VolcanoPlot;
