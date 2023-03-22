import { useMemo } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
// truncation
import {
  OrientationAddon,
  OrientationDefault,
  AxisTruncationAddon,
  independentAxisLogScaleAddon,
  DependentAxisLogScaleAddon,
  ScatterPlotData,
} from '../types/plots';
import { VolcanoPlotData } from '../types/plots/volcanoplot';
// add Shape for truncation
import { Layout, Shape } from 'plotly.js';
import { NumberRange } from '../types/general';

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { tickSettings } from '../utils/tick-settings';
import * as ColorMath from 'color-math';

export interface VolcanoPlotProps
  extends PlotProps<ScatterPlotData>,
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

const EmptyVolcanoPlotData: ScatterPlotData = {
  series: [],
};

/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
const VolcanoPlot = makePlotlyPlotComponent(
  'VolcanoPlot',
  (props: VolcanoPlotProps) => {
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

    // truncation axis range
    const standardIndependentAxisRange = independentAxisRange;
    const extendedIndependentAxisRange = extendAxisRangeForTruncations(
      standardIndependentAxisRange,
      axisTruncationConfig?.independentAxis,
      'number',
      true, // addPadding
      independentAxisLogScale
    );

    // truncation
    const standardDependentAxisRange = dependentAxisRange;
    const extendedDependentAxisRange = extendAxisRangeForTruncations(
      standardDependentAxisRange,
      axisTruncationConfig?.dependentAxis,
      'number',
      true, // addPadding
      dependentAxisLogScale
    );

    // make rectangular layout shapes for truncated axis/missing data
    const truncatedAxisHighlighting: Partial<Shape>[] | undefined =
      useMemo(() => {
        if (data.series.length > 0) {
          const filteredTruncationLayoutShapes = truncationLayoutShapes(
            orientation,
            standardIndependentAxisRange, // send undefined for independentAxisRange
            standardDependentAxisRange,
            extendedIndependentAxisRange, // send undefined for independentAxisRange
            extendedDependentAxisRange,
            axisTruncationConfig
          );

          return filteredTruncationLayoutShapes;
        } else {
          return [];
        }
      }, [
        standardDependentAxisRange,
        extendedDependentAxisRange,
        orientation,
        data,
        axisTruncationConfig,
      ]);

    const layout: Partial<Layout> = {
      hovermode: 'closest',
      xaxis: {
        title: 'log2 Fold Change',
        // truncation
        range: data.series.length
          ? [
              extendedIndependentAxisRange?.min,
              extendedIndependentAxisRange?.max,
            ].map((val) =>
              independentAxisLogScale && val != null
                ? Math.log10(val as number)
                : val
            )
          : undefined,
        zeroline: false, // disable yaxis line
        // make plot border
        mirror: true,
        // date or number type (from variable.type): no log scale for date
        type: undefined,
        tickfont: data.series.length ? {} : { color: 'transparent' },
        ...tickSettings(
          independentAxisLogScale,
          extendedIndependentAxisRange,
          'number'
        ),
      },
      yaxis: {
        title: '-log10 P Value',
        // with the truncated axis, negative values need to be checked for log scale
        range: data.series.length
          ? [
              extendedDependentAxisRange?.min,
              extendedDependentAxisRange?.max,
            ].map((val) =>
              dependentAxisLogScale && val != null
                ? Math.log10(val as number)
                : val
            )
          : undefined,
        // range: undefined,
        zeroline: false, // disable xaxis line
        // make plot border
        mirror: true,
        // date or number type (from variable.type): no log scale for date
        type: undefined,
        tickfont: data.series.length ? {} : { color: 'transparent' },
        ...tickSettings(
          dependentAxisLogScale,
          extendedDependentAxisRange,
          'number'
        ),
      },
      // add truncatedAxisHighlighting for layout.shapes
      // shapes: truncatedAxisHighlighting,
      shapes: [
        {
          type: 'line',
          x0: 0,
          y0: adjustedPValueGate,
          x1: 1,
          y1: adjustedPValueGate,
          line: {
            color: 'rgb(0.3.0.35.0.35)',
            width: 1,
            dash: 'dash',
          },
          xref: 'paper',
          layer: 'below',
        },
        {
          type: 'line',
          x0: foldChangeGates![0],
          y0: 0,
          x1: foldChangeGates![0],
          y1: 1,
          line: {
            color: 'rgb(0.3.0.35.0.35)',
            width: 1,
            dash: 'dash',
          },
          yref: 'paper',
          layer: 'below',
        },
        {
          type: 'line',
          x0: foldChangeGates![1],
          y0: 0,
          x1: foldChangeGates![1],
          y1: 1,
          line: {
            color: 'rgb(0.3.0.35.0.35)',
            width: 1,
            dash: 'dash',
          },
          yref: 'paper',
          layer: 'below',
        },
      ],
    };

    // change data here for marker opacity
    const finalData = useMemo(() => {
      return data.series.map((d: any) => ({
        ...d,
        marker: {
          ...d.marker,
          color:
            d.marker == null
              ? undefined
              : markerBodyOpacity != null
              ? Array.isArray(d.marker.color)
                ? d.marker.color.map((color: string) =>
                    ColorMath.evaluate(
                      color +
                        ' @a ' +
                        (markerBodyOpacity * 100).toString() +
                        '%'
                    ).result.css()
                  )
                : ColorMath.evaluate(
                    d.marker.color +
                      ' @a ' +
                      (markerBodyOpacity * 100).toString() +
                      '%'
                  ).result.css()
              : d.marker.color,
          // need to set marker.line for a transparent case (opacity != 1)
          line:
            d.marker == null
              ? undefined
              : {
                  ...d.marker.line,
                  width:
                    markerBodyOpacity != null
                      ? markerBodyOpacity === 0
                        ? 1
                        : 0
                      : 1,
                },
        },
      }));
    }, [data, markerBodyOpacity]);

    return {
      data: finalData,
      layout,
      ...restProps,
    };
  }
);

export default VolcanoPlot;
