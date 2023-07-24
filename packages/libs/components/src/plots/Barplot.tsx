import { useMemo } from 'react';
import { PlotParams } from 'react-plotly.js';
import {
  BarLayoutAddon,
  BarplotData,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
  DependentAxisLogScaleAddon,
  DependentAxisLogScaleDefault,
  // truncation
  AxisTruncationAddon,
} from '../types/plots';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
// add Shape for truncation
import { Layout, Shape } from 'plotly.js';
import { some, uniq, flatMap } from 'lodash';
// util functions for handling long tick labels with ellipsis
import { axisTickLableEllipsis } from '../utils/axis-tick-label-ellipsis';
import { NumberRange } from '../types/general';

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { tickSettings } from '../utils/tick-settings';

// in this example, the main variable is 'country'
export interface BarplotProps
  extends PlotProps<BarplotData>,
    BarLayoutAddon<'overlay' | 'stack' | 'group'>,
    OrientationAddon,
    OpacityAddon,
    DependentAxisLogScaleAddon,
    // truncation
    AxisTruncationAddon {
  /** Label for independent axis. e.g. 'Country' */
  independentAxisLabel?: string;
  /** Label for dependent axis. Defaults to 'Count' */
  dependentAxisLabel?: string;
  /** Show value for each bar */
  showValues?: boolean;
  /** show/hide independent axis tick label, default is true */
  showIndependentAxisTickLabel?: boolean;
  /** show/hide dependent axis tick label, default is true */
  showDependentAxisTickLabel?: boolean;
  /** dependent axis range: required for showing ticks and their labels properly for log scale */
  dependentAxisRange?: NumberRange;
}

const EmptyBarplotData: BarplotData = { series: [] };

/** A Plotly-based Barplot component. */
const Barplot = makePlotlyPlotComponent(
  'BarPlot',
  ({
    data = EmptyBarplotData,
    independentAxisLabel,
    dependentAxisLabel,
    showValues = false,
    orientation = OrientationDefault,
    opacity = OpacityDefault,
    barLayout = 'group',
    showIndependentAxisTickLabel = true,
    showDependentAxisTickLabel = true,
    dependentAxisLogScale = DependentAxisLogScaleDefault,
    dependentAxisRange,
    // truncation
    axisTruncationConfig,
    ...restProps
  }: BarplotProps) => {
    // set tick label Length for ellipsis
    const maxIndependentTickLabelLength = 20;

    // get the order of the provided category values (labels shown along x-axis)
    // get them in the given order, and trivially unique-ify them, if traces have different values
    // this will also be used as tooltip text for axis tick labels
    const categoryOrder = useMemo(
      () => uniq(flatMap(data.series, (d) => d.label)),
      [data]
    );

    // change categoriOrder to have ellipsis
    const categoryOrderEllipsis = useMemo(
      () => axisTickLableEllipsis(categoryOrder, maxIndependentTickLabelLength),
      [data, categoryOrder]
    );

    // Transform `data` into a Plot.ly friendly format.
    const plotlyFriendlyData: PlotParams['data'] = useMemo(
      () =>
        data.series.map((el: any) => {
          // set opacity only for overlay & multiple data
          const calculatedOpacity =
            barLayout === 'overlay' && data.series.length > 1 ? opacity : 1;

          // check data exist
          if (el.label && el.value) {
            return {
              // mapping data based on categoryOrder and categoryOrderEllipsis
              x:
                orientation === 'vertical'
                  ? el.label.map((d: string) => {
                      const foundIndexValue = categoryOrder.findIndex(
                        (element) => element === d
                      );
                      return categoryOrderEllipsis[foundIndexValue];
                    })
                  : el.value,
              y:
                orientation === 'vertical'
                  ? el.value
                  : el.label.map((d: string) => {
                      const findIndexValue = categoryOrder.findIndex(
                        (element) => element === d
                      );
                      return categoryOrderEllipsis[findIndexValue];
                    }),
              name: el.name, // legend name
              showlegend: el.name ? true : false,
              orientation: orientation === 'vertical' ? 'v' : 'h',
              opacity: calculatedOpacity,
              type: 'bar',
              text: showValues ? el.value : undefined,
              textposition: showValues ? 'auto' : undefined,
              marker: {
                color: el.color,
                line: {
                  width: el.borderColor ? 1 : 0,
                  color: el.borderColor,
                },
              },
              hovertemplate: el.value.map(
                (value: number, index: number) =>
                  `${value}<br />${el.label[index]}<br />${el.name}<extra></extra>`
              ),
            };
          } else {
            return {};
          }
        }),
      [data, barLayout, orientation, showValues, opacity]
    );

    // if at least one value is 0 < x < 1 then these are probably fractions/proportions
    // affects mouseover formatting only in logScale mode
    // worst case is that mouseovers contain integers followed by .0000
    const dataLooksFractional = useMemo(() => {
      return some(
        data.series.flatMap((series) => series.value),
        (val) => val > 0 && val < 1
      );
    }, [data.series]);

    const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
      automargin: true,
      showgrid: false,
      zeroline: false,
      showline: dependentAxisLogScale || dataLooksFractional,
      title: {
        text: independentAxisLabel ? independentAxisLabel : '',
      },
      range: data.series.length ? undefined : [0, 10],
      tickfont: data.series.length ? {} : { color: 'transparent' },
      showticklabels: showIndependentAxisTickLabel,
    };

    // truncation
    const standardDependentAxisRange = dependentAxisRange;
    const extendedDependentAxisRange = extendAxisRangeForTruncations(
      standardDependentAxisRange,
      axisTruncationConfig?.dependentAxis,
      'number',
      // set plot type not to have padding/margin on the min
      false,
      dependentAxisLogScale
    ) as NumberRange | undefined;
    // make rectangular layout shapes for truncated axis/missing data
    const truncatedAxisHighlighting: Partial<Shape>[] | undefined =
      useMemo(() => {
        if (data.series.length > 0) {
          const filteredTruncationLayoutShapes = truncationLayoutShapes(
            orientation,
            undefined, // send undefined for independentAxisRange
            standardDependentAxisRange,
            undefined, // send undefined for independentAxisRange
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
        data.series,
        axisTruncationConfig,
      ]);

    const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
      automargin: true,
      hoverformat: dependentAxisLogScale
        ? dataLooksFractional
          ? ',.4f'
          : ',.0f'
        : undefined,
      type: dependentAxisLogScale ? 'log' : 'linear',
      title: {
        text: dependentAxisLabel ? dependentAxisLabel : '',
      },
      tickfont: data.series.length ? {} : { color: 'transparent' },
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
        : [0, 10],
      showticklabels: showDependentAxisTickLabel,
      ...tickSettings(
        dependentAxisLogScale,
        extendedDependentAxisRange,
        'number'
      ),
    };

    const layout: Partial<Layout> = {
      xaxis:
        orientation === 'vertical'
          ? independentAxisLayout
          : dependentAxisLayout,
      yaxis:
        orientation === 'vertical'
          ? dependentAxisLayout
          : independentAxisLayout,
      barmode: barLayout,
      hovermode: 'closest',
      // add truncatedAxisHighlighting for layout.shapes
      shapes: truncatedAxisHighlighting,
    };

    return {
      data: plotlyFriendlyData,
      layout,
      // original independent axis tick labels for tooltip
      storedIndependentAxisTickLabel: categoryOrder,
      ...restProps,
    };
  }
);

export default Barplot;
