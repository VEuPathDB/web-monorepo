import { PlotProps } from './PlotlyPlot';

import { significanceColors } from '../types/plots';
import { VolcanoPlotData } from '../types/plots/volcanoplot';
import { NumberRange } from '../types/general';
import {
  XYChart,
  Tooltip,
  Axis,
  Grid,
  GlyphSeries,
  Annotation,
  AnnotationLineSubject,
} from '@visx/xychart';
import { Group } from '@visx/group';
import { max, min } from 'lodash';

export interface VolcanoPlotProps extends PlotProps<VolcanoPlotData> {
  /**
   * Used to set the fold change thresholds. Will
   * set two thresholds at +/- this number.
   */
  log2FoldChangeThreshold: number;
  /** Set the threshold for significance. */
  significanceThreshold: number;
  /** x-axis range:  */
  independentAxisRange?: NumberRange;
  /** y-axis range: */
  dependentAxisRange?: NumberRange;
  /**
   * Array of size 2 that contains a label for the left and right side
   * of the x axis. (Not yet implemented). Expect this to be passed by the viz based
   * on the type of data we're using (genes vs taxa vs etc.)
   */
  comparisonLabels?: Array<string>;
  /** What is this plot's name? */
  plotTitle?: string;
  /** marker color opacity: range from 0 to 1 */
  markerBodyOpacity?: number;
}

const EmptyVolcanoPlotData: VolcanoPlotData = {
  foldChange: [],
  pValue: [],
  adjustedPValue: [],
  pointId: [],
};

interface DataPoint {
  foldChange: string;
  pValue: string;
  adjustedPValue: string;
  pointId: string;
  color: string;
}

/**
 * The Volcano Plot displays points on a (magnitude change) by (significance) xy axis.
 * It also colors the points based on their significance and magnitude change.
 */
function VolcanoPlot(props: VolcanoPlotProps) {
  const {
    data = EmptyVolcanoPlotData,
    independentAxisRange,
    dependentAxisRange,
    significanceThreshold,
    log2FoldChangeThreshold,
    markerBodyOpacity,
    ...restProps
  } = props;

  /**
   * Find mins and maxes of the data and for the plot
   */

  const dataXMin = min(data.foldChange.map(Number));
  const dataXMax = max(data.foldChange.map(Number));
  const dataYMin = min(data.pValue.map(Number));
  const dataYMax = max(data.pValue.map(Number));

  // Determine mins, maxes of axes in the plot.
  // These are different than the data mins/maxes because
  // of the log transform and the little bit of padding.
  //

  let xMin: number;
  let xMax: number;
  let yMin: number;
  let yMax: number;

  // Log transform for plotting, and add a little margin for axes
  if (dataXMin && dataXMax) {
    xMin = Math.log2(dataXMin);
    xMax = Math.log2(dataXMax);
    xMin = xMin - (xMax - xMin) * 0.05;
    xMax = xMax + (xMax - xMin) * 0.05;
  } else {
    xMin = 0;
    xMax = 0;
  }
  if (dataYMin && dataYMax) {
    yMin = -Math.log10(dataYMax);
    yMax = -Math.log10(dataYMin);
    yMin = yMin - (yMax - yMin) * 0.05;
    yMax = yMax + (yMax - yMin) * 0.05;
  } else {
    yMin = 0;
    yMax = 0;
  }

  /**
   * Turn the data (array of arrays) into data points (array of points)
   */

  let dataPoints: DataPoint[] = [];

  // Loop through the data and return points. Doesn't really matter
  // which var of the data we map over.
  data.foldChange.forEach((fc, ind: number) => {
    dataPoints.push({
      foldChange: fc,
      pValue: data.pValue[ind],
      adjustedPValue: data.adjustedPValue[ind],
      pointId: data.pointId[ind],
      color: assignSignificanceColor(
        Math.log2(Number(fc)),
        Number(data.pValue[ind]),
        significanceThreshold,
        log2FoldChangeThreshold,
        significanceColors
      ),
    });
  });

  /**
   * Accessors - tell visx which value of each points we should use and where.
   */

  const dataAccessors = {
    xAccessor: (d: any) => {
      return Math.log2(d?.foldChange);
    },
    yAccessor: (d: any) => {
      return -Math.log10(d?.pValue);
    },
  };

  const thresholdLineAccessors = {
    xAccessor: (d: any) => {
      return d?.x;
    },
    yAccessor: (d: any) => {
      return d?.y;
    },
  };

  /**
   * Plot styles
   * (can eventually be moved to a new file and applied as a visx theme)
   */
  const thresholdLineStyles = {
    stroke: '#aaaaaa',
    strokeWidth: 1,
    strokeDasharray: 3,
  };
  const axisStyles = {
    stroke: '#bbbbbb',
    strokeWidth: 1,
  };
  const gridStyles = {
    stroke: '#dddddd',
    strokeWidth: 0.5,
  };

  return (
    // From docs " For correct tooltip positioning, it is important to wrap your
    // component in an element (e.g., div) with relative positioning."
    <div style={{ position: 'relative' }}>
      <XYChart
        height={300}
        xScale={{ type: 'linear', domain: [xMin, xMax] }}
        yScale={{ type: 'linear', domain: [yMin, yMax], zero: false }}
        width={300}
      >
        <Grid numTicks={6} lineStyle={gridStyles} />
        <Axis orientation="left" label="-log10 Raw P Value" {...axisStyles} />
        <Axis orientation="bottom" label="log2 Fold Change" {...axisStyles} />

        {/* Draw threshold lines as annotations below the data points */}
        {significanceThreshold && (
          <Annotation
            datum={{
              x: 0, // horizontal line so x could be anything
              y: -Math.log10(Number(significanceThreshold)),
            }}
            {...thresholdLineAccessors}
          >
            <AnnotationLineSubject
              orientation="horizontal"
              {...thresholdLineStyles}
            />
          </Annotation>
        )}
        {log2FoldChangeThreshold && (
          <>
            <Annotation
              datum={{
                x: -log2FoldChangeThreshold,
                y: 0, // vertical line so y could be anything
              }}
              {...thresholdLineAccessors}
            >
              <AnnotationLineSubject {...thresholdLineStyles} />
            </Annotation>
            <Annotation
              datum={{
                x: log2FoldChangeThreshold,
                y: 0, // vertical line so y could be anything
              }}
              {...thresholdLineAccessors}
            >
              <AnnotationLineSubject {...thresholdLineStyles} />
            </Annotation>
          </>
        )}

        {/* The data itself */}
        <Group opacity={markerBodyOpacity ?? 1}>
          <GlyphSeries
            dataKey={'data'}
            data={dataPoints}
            {...dataAccessors}
            colorAccessor={(d) => {
              return d.color;
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
  xValue: number, // has already been log2 transformed
  yValue: number, // the raw pvalue
  significanceThreshold: number,
  log2FoldChangeThreshold: number,
  significanceColors: string[] // Assuming the order is [high, low, not significant]
) {
  // Test 1. If the y value is higher than the significance threshold, just return not significant
  if (yValue >= significanceThreshold) {
    return significanceColors[2];
  }

  // Test 2. So the y is significant. Is the x larger than the positive foldChange threshold?
  if (xValue >= log2FoldChangeThreshold) {
    return significanceColors[0];
  }

  // Test 3. Is the x value lower than the negative foldChange threshold?
  if (xValue <= -log2FoldChangeThreshold) {
    return significanceColors[1];
  }

  // If we're still here, it must be a non significant point.
  return significanceColors[2];
}

export default VolcanoPlot;
