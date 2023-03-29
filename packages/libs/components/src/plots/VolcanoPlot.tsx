import { useMemo } from 'react';
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

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { tickSettings } from '../utils/tick-settings';
import * as ColorMath from 'color-math';

export interface VolcanoPlotProps
  extends PlotProps<VolcanoPlotData>,
    // truncation
    OrientationAddon,
    independentAxisLogScaleAddon,
    DependentAxisLogScaleAddon,
    AxisTruncationAddon {
  /** x-axis range: required for confidence interval - not really */
  independentAxisRange?: NumberRange;
  /** y-axis range: required for confidence interval */
  dependentAxisRange?: NumberRange;
  foldChangeGates?: Array<number>;
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
    foldChangeGates,
    ...restProps
  } = props;

  // add truncation

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

  // this should be -log2 etc.
  const dataAccessors = {
    xAccessor: (d: any) => {
      return Math.log2(d.foldChange);
    },
    yAccessor: (d: any) => {
      return -Math.log10(d.adjustedPValue);
    },
  };

  const thresholdLineAccessors = {
    xAccessor: (d: any) => {
      return d.x;
    },
    yAccessor: (d: any) => {
      return d.y;
    },
  };

  return (
    <XYChart
      height={300}
      xScale={{ type: 'linear', domain: [-7, 7] }}
      yScale={{ type: 'linear', domain: [-2, 4] }}
      width={300}
    >
      <Axis orientation="left" label="-log10 Raw P Value" />
      <Grid columns={false} numTicks={4} />
      <Axis orientation="bottom" label="log2 Fold Change" />
      {formattedData.map((series: any, index: any) => {
        console.log(series);
        return (
          <GlyphSeries
            dataKey={'mydata' + String(Math.random())}
            data={series}
            {...dataAccessors}
          />
        );
      })}
    </XYChart>
  );
}

export default VolcanoPlot;
