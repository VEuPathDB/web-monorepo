import { useMemo, useCallback } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';

// truncation
import {
  OrientationAddon,
  OrientationDefault,
  AxisTruncationAddon,
  independentAxisLogScaleAddon,
  DependentAxisLogScaleAddon,
} from '../types/plots';
import {
  VolcanoPlotData,
  VolcanoPlotDataSeries,
} from '../types/plots/volcanoplot';
// add Shape for truncation
import { NumberRange } from '../types/general';
import {
  XYChart,
  Tooltip,
  Axis,
  Grid,
  GlyphSeries,
  LineSeries,
} from '@visx/xychart';
import { useTooltip } from '@visx/tooltip';
import { max, min } from 'lodash';

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { tickSettings } from '../utils/tick-settings';
import * as ColorMath from 'color-math';
import { rgb } from 'd3';

export interface VolcanoPlotProps
  extends PlotProps<VolcanoPlotData>,
    // truncation
    OrientationAddon,
    independentAxisLogScaleAddon,
    DependentAxisLogScaleAddon,
    AxisTruncationAddon {
  /** x-axis range:  */
  independentAxisRange?: NumberRange;
  /** y-axis range: */
  dependentAxisRange?: NumberRange;
  foldChangeGate?: number;
  comparisonLabels?: Array<string>;
  adjustedPValueGate?: number;
  plotTitle?: string;

  /** marker color opacity: range from 0 to 1 */
  markerBodyOpacity?: number;
}

const EmptyVolcanoPlotData: VolcanoPlotData = {
  data: [],
};

/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
function VolcanoPlot(props: VolcanoPlotProps) {
  const {
    data = EmptyVolcanoPlotData,
    independentAxisRange,
    dependentAxisRange,
    // independentAxisLabel,
    // dependentAxisLabel,
    // independentValueType,
    // dependentValueType,
    // truncation
    orientation = OrientationDefault,
    axisTruncationConfig,
    independentAxisLogScale = false,
    dependentAxisLogScale = false,
    markerBodyOpacity,
    adjustedPValueGate,
    foldChangeGate,
    ...restProps
  } = props;

  // add truncation

  // Axis ranges
  // Let's do something dumb for now...
  let xMin: number | undefined;
  let xMax: number | undefined;
  let yMin: number | undefined;
  let yMax: number | undefined;

  data.data.forEach((series, index: number) => {
    if (index == 0) {
      xMin = min(series.foldChange.map((fc) => Math.log2(Number(fc))));
      xMax = max(series.foldChange.map((fc) => Math.log2(Number(fc))));
      yMin = min(series.adjustedPValue.map((apv) => -Math.log10(Number(apv))));
      yMax = max(series.adjustedPValue.map((apv) => -Math.log10(Number(apv))));
    } else {
      xMin = min([
        xMin,
        min(series.foldChange.map((fc) => Math.log2(Number(fc)))),
      ]);
      xMax = max([
        xMax,
        max(series.foldChange.map((fc) => Math.log2(Number(fc)))),
      ]);
      yMin = min([
        yMin,
        min(series.adjustedPValue.map((apv) => -Math.log10(Number(apv)))),
      ]);
      yMax = max([
        yMax,
        max(series.adjustedPValue.map((apv) => -Math.log10(Number(apv)))),
      ]);
    }
  });

  // Add a little margin for axes
  if (xMin && xMax) {
    xMin = xMin - (xMax - xMin) * 0.05;
    xMax = xMax + (xMax - xMin) * 0.05;
  } else {
    xMin = 0;
    xMax = 0;
  }
  if (yMin && yMax) {
    yMin = yMin - (yMax - yMin) * 0.05;
    yMax = yMax + (yMax - yMin) * 0.05;
  } else {
    yMin = 0;
    yMax = 0;
  }

  // process the data. unzip and zip
  function formatData(series: VolcanoPlotDataSeries) {
    // assume at least foldChange is there (should be type error if not!)
    let seriesPoints: {
      foldChange: string;
      pValue: string;
      adjustedPValue: string;
      pointId: string;
    }[] = [];

    series.foldChange.forEach((value: string, index: number) => {
      // Find axis ranges
      seriesPoints.push({
        foldChange: value,
        pValue: series.pValue[index],
        adjustedPValue: series.adjustedPValue[index],
        pointId: series.pointId[index],
      });
    });

    return seriesPoints;
  }

  const formattedData = data.data.map((series) => formatData(series));

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

  const thresholdLineStyles = {
    stroke: '#aaaaaa',
    strokeWidth: 1,
    strokeDasharray: 3,
  };

  const axisStyles = {
    stroke: '#bbbbbb',
    strokeWidth: 1,
  };

  // move the following to addOns? maybe leave here until needed in another plot
  const volcanoColors = ['#fa1122', '#cccccc', '#2211fa'];

  // tooltip??
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  console.log('tooltipdata');
  console.log(tooltipData);

  return (
    // From docs " For correct tooltip positioning, it is important to wrap your
    // component in an element (e.g., div) with relative positioning."
    <div style={{ position: 'relative' }}>
      <XYChart
        height={300}
        xScale={{ type: 'linear', domain: [xMin!, xMax!] }}
        yScale={{ type: 'linear', domain: [yMin!, yMax!] }}
        width={300}
      >
        <Grid
          numTicks={6}
          lineStyle={{ stroke: '#dddddd', strokeWidth: 0.5 }}
        />
        <Axis orientation="left" label="-log10 Raw P Value" {...axisStyles} />
        <Axis orientation="bottom" label="log2 Fold Change" {...axisStyles} />

        {/* Draw threshold lines below data points */}
        {adjustedPValueGate && (
          <LineSeries
            data={[
              { x: xMin, y: -Math.log10(Number(adjustedPValueGate)) },
              { x: xMax, y: -Math.log10(Number(adjustedPValueGate)) },
            ]}
            dataKey="pvalLine"
            enableEvents={false}
            {...thresholdLineStyles}
            {...thresholdLineAccessors}
          />
        )}
        {foldChangeGate && (
          <LineSeries
            data={[
              { x: -Math.log2(foldChangeGate), y: yMin },
              { x: -Math.log2(foldChangeGate), y: yMax },
            ]}
            dataKey="foldChangeLineLow"
            enableEvents={false}
            {...thresholdLineStyles}
            {...thresholdLineAccessors}
          />
        )}
        {foldChangeGate && (
          <LineSeries
            data={[
              { x: Math.log2(foldChangeGate), y: yMin },
              { x: Math.log2(foldChangeGate), y: yMax },
            ]}
            dataKey="foldChangeLineHigh"
            enableEvents={false}
            {...thresholdLineStyles}
            {...thresholdLineAccessors}
          />
        )}
        {formattedData.map((series: any, index: any) => {
          console.log(series);
          return (
            <GlyphSeries
              dataKey={'mydata' + String(index)}
              data={series}
              {...dataAccessors}
              colorAccessor={(d) => {
                return volcanoColors[index];
              }}
            />
          );
        })}
        <Tooltip
          snapTooltipToDatumX={false}
          snapTooltipToDatumY={false}
          showVerticalCrosshair={true}
          showHorizontalCrosshair={true}
          showSeriesGlyphs={false}
          renderTooltip={({ tooltipData }) => {
            console.log(tooltipData);
            const isThresholdLine =
              tooltipData?.nearestDatum?.key.includes('Line');
            return (
              <div>
                <div style={{ color: '#229911' }}>
                  {tooltipData?.nearestDatum?.key}
                </div>
                {isThresholdLine ? (
                  'thresholdline!'
                ) : (
                  <div>
                    {dataAccessors.xAccessor(tooltipData?.nearestDatum?.datum)}
                    {', '}
                    {dataAccessors.yAccessor(tooltipData?.nearestDatum?.datum)}
                  </div>
                )}
              </div>
            );
          }}
        />
      </XYChart>
    </div>
  );
}

export default VolcanoPlot;
