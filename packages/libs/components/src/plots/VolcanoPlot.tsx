import { PlotProps } from './PlotlyPlot';

import { significanceColors } from '../types/plots';
import {
  VolcanoPlotData,
  VolcanoPlotDataSeries,
} from '../types/plots/volcanoplot';
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
  /** x-axis range:  */
  independentAxisRange?: NumberRange;
  /** y-axis range: */
  dependentAxisRange?: NumberRange;
  /**
   * Used to set the fold change thresholds. Will
   * set two thresholds at +/- this number
   */
  foldChangeThreshold?: number;
  /** Set the threshold for significance. */
  significanceThreshold?: number;
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
  series: [],
};

/**
 * The Volcano Plot displays points on a (magnitude change) by (significance) xy axis.
 */
function VolcanoPlot(props: VolcanoPlotProps) {
  const {
    data = EmptyVolcanoPlotData,
    independentAxisRange,
    dependentAxisRange,
    markerBodyOpacity,
    significanceThreshold,
    foldChangeThreshold,
    ...restProps
  } = props;

  /**
   * Find mins, maxes, and format data while we're at it.
   * These are all lumped together so that we only have to go
   * through the data once. */
  function formatData(data: VolcanoPlotData) {
    // Prep
    let dataXMin: number | undefined;
    let dataXMax: number | undefined;
    let dataYMin: number | undefined;
    let dataYMax: number | undefined;

    // Loop through the data and format. While we're here, might
    // as well also get the data mins and maxes for the axes.
    const formattedData = data.series.map((series, index: number) => {
      let seriesPoints: {
        foldChange: string;
        pValue: string;
        adjustedPValue: string;
        pointId: string;
        colorNum: number;
      }[] = [];

      if (index == 0) {
        dataXMin = min(series.foldChange.map((fc) => Number(fc)));
        dataXMax = max(series.foldChange.map((fc) => Number(fc)));
        dataYMin = min(series.adjustedPValue.map((apv) => Number(apv)));
        dataYMax = max(series.adjustedPValue.map((apv) => Number(apv)));
      } else {
        dataXMin = min([
          dataXMin,
          min(series.foldChange.map((fc) => Number(fc))),
        ]);
        dataXMax = max([
          dataXMax,
          max(series.foldChange.map((fc) => Number(fc))),
        ]);
        dataYMin = min([
          dataYMin,
          min(series.adjustedPValue.map((apv) => Number(apv))),
        ]);
        dataYMax = max([
          dataYMax,
          max(series.adjustedPValue.map((apv) => Number(apv))),
        ]);
      }
      series.foldChange.forEach((v: string, ind: number) => {
        seriesPoints.push({
          foldChange: series.foldChange[ind],
          pValue: series.pValue[ind],
          adjustedPValue: series.adjustedPValue[ind],
          pointId: series.pointId[ind],
          colorNum: index,
        });
      });

      return seriesPoints;
    });

    return { formattedData, dataXMin, dataXMax, dataYMin, dataYMax };
  }

  const { formattedData, dataXMin, dataXMax, dataYMin, dataYMax } =
    formatData(data);
  console.log(formattedData);

  /**
   * Determine mins, maxes of axes in the plot.
   * These are different than the data mins/maxes because
   * of the log transform and the little bit of padding.
   */

  let xMin: number;
  let xMax: number;
  let yMin: number;
  let yMax: number;

  // Log transform for plotting, and add a little margin for axes
  if (dataXMin && dataXMax) {
    xMin = Math.log2(dataXMin);
    xMin = xMin - (xMin - xMin) * 0.05;
    xMax = Math.log2(dataXMax);
    xMax = xMax + (xMax - xMax) * 0.05;
  } else {
    xMin = 0;
    xMax = 0;
  }
  if (dataYMin && dataYMax) {
    yMin = -Math.log10(dataYMax);
    yMax = -Math.log10(dataYMin);
    yMin = yMin - (yMin - yMin) * 0.05;
    yMax = yMax + (yMax - yMax) * 0.05;
  } else {
    yMin = 0;
    yMax = 0;
  }

  /**
   * Accessors
   */

  const dataAccessors = {
    xAccessor: (d: any) => {
      return Math.log2(d?.foldChange);
    },
    yAccessor: (d: any) => {
      return -Math.log10(d?.adjustedPValue);
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
        yScale={{ type: 'linear', domain: [yMin, yMax] }}
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
        {foldChangeThreshold && (
          <>
            <Annotation
              datum={{
                x: -Math.log2(foldChangeThreshold),
                y: 0, // vertical line so y could be anything
              }}
              {...thresholdLineAccessors}
            >
              <AnnotationLineSubject {...thresholdLineStyles} />
            </Annotation>
            <Annotation
              datum={{
                x: Math.log2(foldChangeThreshold),
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
          {formattedData.map((series: any, index: any) => {
            return (
              <GlyphSeries
                dataKey={'data' + String(index)}
                data={series}
                {...dataAccessors}
                colorAccessor={(d) => {
                  return significanceColors[d.colorNum];
                }}
              />
            );
          })}
        </Group>
      </XYChart>
    </div>
  );
}

export default VolcanoPlot;
