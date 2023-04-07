import { useCallback, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';

// Definitions
import {
  HistogramData,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
  BarLayoutAddon,
  DependentAxisLogScaleAddon,
  DependentAxisLogScaleDefault,
  AxisTruncationAddon,
} from '../types/plots';
import {
  NumberOrDateRange,
  NumberRange,
  DateRange,
  Bin,
} from '../types/general';

// Libraries
import * as DateMath from 'date-arithmetic';
import {
  sortBy,
  sortedUniqBy,
  some,
  find,
  findLast,
  first,
  last,
} from 'lodash';

// Components
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { Layout, Shape } from 'plotly.js';

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { tickSettings } from '../utils/tick-settings';

// bin middles needed for highlighting
interface BinSummary {
  binStart: Bin['binStart'];
  binEnd: Bin['binEnd'];
  binMiddle: Bin['binEnd'];
}

const EmptyHistogramData: HistogramData = { series: [] };
const SMALL_NUMBER_OF_BINS = 4;

export interface HistogramProps
  extends PlotProps<HistogramData>,
    OrientationAddon,
    OpacityAddon,
    BarLayoutAddon<'overlay' | 'stack'>,
    DependentAxisLogScaleAddon,
    AxisTruncationAddon {
  /** Label for independent axis. Defaults to `Bins`. */
  independentAxisLabel?: string;
  /** Label for dependent axis. Defaults to `Count`. */
  dependentAxisLabel?: string;
  /** Range for the dependent axis (usually y-axis) */
  // can only be numeric
  dependentAxisRange?: NumberRange;
  /** Show value for each bar */
  showValues?: boolean;
  /** A range to highlight by means of opacity */
  selectedRange?: NumberOrDateRange;
  /** function to call upon selecting a range (in independent axis) */
  onSelectedRangeChange?: (newRange?: NumberOrDateRange) => void;
  /** Min and max allowed values for the selected range.
   *  Used to keep graphical range selections within the range of the data. Optional.
   *  And now DEPRECATED. Do not use. */
  selectedRangeBounds?: NumberOrDateRange; // TO DO: handle DateRange too
  /** Relevant to range selection - flag to indicate if the data is zoomed in. Default false.
   * Also DEPRECATED along with selectedRangeBounds */
  isZoomed?: boolean;
  /** independent axis range min and max */
  independentAxisRange?: NumberOrDateRange;
  /** Assuming independentAxisRange is inclusive at both ends,
   * is binStart inclusive or exclusive? Setting this appropriately will
   * ensure that the bins containing data equal to independentAxisRange min and max are shown
   * Default 'inclusive'
   **/
  binStartType?: 'inclusive' | 'exclusive';
  /** See binStartType for full explanation
   * is binEnd inclusive or exclusive? default 'inclusive' */
  binEndType?: 'inclusive' | 'exclusive';
}

/** A Plot.ly based histogram component. */
const Histogram = makePlotlyPlotComponent(
  'Histogram',
  ({
    data = EmptyHistogramData,
    independentAxisLabel = 'Bins',
    dependentAxisLabel = 'Count',
    orientation = OrientationDefault,
    opacity = OpacityDefault,
    barLayout = 'overlay',
    dependentAxisRange,
    dependentAxisLogScale = DependentAxisLogScaleDefault,
    showValues,
    selectedRange,
    onSelectedRangeChange = () => {},
    selectedRangeBounds,
    isZoomed = false,
    independentAxisRange,
    axisTruncationConfig,
    binStartType = 'inclusive',
    binEndType = 'inclusive',
    ...restProps
  }: HistogramProps) => {
    if (selectedRangeBounds || isZoomed)
      console.log(
        'WARNING: Histogram.selectedRangeBounds and isZoomed are deprecated - behaviour may be unexpected'
      );

    /**
     * Determine bar opacity. Only applicable when in overlay
     * mode and there are >1 series.
     * Values less than 0.75 recommended to avoid it looking like a stacked chart.
     * If providing an opacity slider, don't let values go higher than 0.75.
     */
    const calculatedBarOpacity: number = useMemo(() => {
      return barLayout === 'overlay' && data.series.length > 1 ? opacity : 1;
    }, [barLayout, data.series.length, opacity]);

    // Transform `data` into a Plot.ly friendly format.
    const plotlyFriendlyData: PlotParams['data'] = useMemo(
      () =>
        data.series.map((series) => {
          const binStarts = series.bins.map((bin) => bin.binStart);
          const binLabels = series.bins.map((bin) => bin.binLabel); // see TO DO: below
          const binCounts = series.bins.map((bin) => bin.value);
          const binWidths = series.bins.map((bin) => {
            // Final bar needs to be a tiny bit narrower, especially
            // if you are using white bars with borderColor,
            // so that the right hand border is visible.
            // Might be worth checking in future versions of Plotly if this
            // was a bug or not.
            if (
              data.binWidthSlider?.valueType != null &&
              data.binWidthSlider?.valueType === 'date'
            ) {
              // date, needs to be in milliseconds
              // TO DO: bars seem very slightly too narrow at monthly resolution (multiplying by 1009 fixes it)
              return (
                DateMath.diff(
                  new Date(bin.binStart as string),
                  new Date(bin.binEnd as string),
                  'seconds',
                  false
                ) * 1000
              );
            } else {
              return (bin.binEnd as number) - (bin.binStart as number);
            }
          });

          const [xAxisName, yAxisName] =
            orientation === 'vertical' ? ['x', 'y'] : ['y', 'x'];

          return {
            type: 'bar',
            [xAxisName]: binStarts.length ? binStarts : [null], // hack to make sure empty series
            [yAxisName]: binCounts.length ? binCounts : [null], // show up in the legend
            opacity: calculatedBarOpacity,
            orientation: orientation === 'vertical' ? 'v' : 'h',
            name: series.name,
            showlegend: series.name ? true : false, // empty name will disable legend
            // text: binLabels, // TO DO: find a way to show concise bin labels
            text: showValues ? binCounts.map(String) : undefined,
            textposition: showValues ? 'auto' : undefined,
            marker: {
              color: series.color,
              line: {
                width: series.borderColor ? 1 : 0,
                color: series.borderColor,
              },
            },
            offset: 0,
            width: binWidths,
            selected: {
              marker: {
                opacity: 1,
              },
            },
            unselected: {
              // switch off fading of unselected bars while selecting
              marker: {
                opacity: 1,
              },
            },
            hovertemplate: binCounts.map(
              (count, index) =>
                `${count}<br />${binLabels[index]}<br />${series.name}<extra></extra>`
            ),
          };
        }),
      [data, orientation, calculatedBarOpacity, selectedRange, showValues]
    );

    /**
     * calculate midpoints of a unique set of bins
     */
    const binSummaries: BinSummary[] = useMemo(() => {
      const allBins: Bin[] = data.series.flatMap((series) => series.bins);

      const sortedBins = sortBy(allBins, (bin) => bin.binStart);
      const uniqueBins = sortedUniqBy(sortedBins, (bin) => bin.binLabel);

      // return the list of summaries - note the binMiddle prop
      return uniqueBins.map(({ binStart, binEnd }) => ({
        binStart,
        binEnd,
        binMiddle:
          data.binWidthSlider?.valueType === 'date'
            ? DateMath.add(
                new Date(binStart as string),
                DateMath.diff(
                  new Date(binStart as string),
                  new Date(binEnd as string),
                  'seconds',
                  false
                ) * 500,
                'milliseconds'
              ).toISOString()
            : ((binStart as number) + (binEnd as number)) / 2.0,
      }));
    }, [data.series, data.binWidthSlider?.valueType]);

    // local state for range **while selecting** graphically
    const [selectingRange, setSelectingRange] = useState<NumberOrDateRange>();

    const handleSelectingRange = useCallback(
      (object: any) => {
        if (object && object.range) {
          const [val1, val2] =
            orientation === 'vertical' ? object.range.x : object.range.y;
          const [min, max] = val1 > val2 ? [val2, val1] : [val1, val2];
          // TO DO: carefully test/debug time zones and different browsers
          // ISO-ify time part of plotly's response
          const rawRange: NumberOrDateRange = {
            min:
              typeof min === 'string'
                ? min.replace(/ /, 'T').replace(/\.\d+$/, '')
                : min,
            max:
              typeof max === 'string'
                ? max.replace(/ /, 'T').replace(/\.\d+$/, '')
                : max,
          };
          // now snap to bin boundaries using same logic that Plotly uses
          // (dragging range past middle of bin selects it)
          const leftBin = binSummaries.find(
            (bin) => rawRange.min < bin.binMiddle
          );
          const rightBin = findLast(
            binSummaries,
            (bin) => rawRange.max > bin.binMiddle
          );
          if (leftBin && rightBin && leftBin.binStart <= rightBin.binStart) {
            setSelectingRange({
              min: leftBin.binStart,
              max:
                data.binWidthSlider?.valueType === 'date'
                  ? DateMath.subtract(
                      new Date(rightBin.binEnd),
                      1,
                      'day'
                    ).toISOString()
                  : rightBin.binEnd,
            } as NumberOrDateRange);
          } else {
            setSelectingRange(undefined);
          }
        }
      },
      [orientation, binSummaries, data.binWidthSlider?.valueType]
    );

    // handle finshed/completed (graphical) range selection
    const handleSelectedRange = useCallback(() => {
      if (selectingRange) {
        onSelectedRangeChange(selectingRange);
      } else {
        // TO DO: be able to reset/unset the selected range
        // by passing undefined to onSelectedRangeChange
        // when a selection of zero bins has been made
      }
      setSelectingRange(undefined);
    }, [selectingRange, onSelectedRangeChange, setSelectingRange]);

    const selectedRangeHighlighting: Partial<Shape>[] = useMemo(() => {
      const range = selectingRange ?? selectedRange;

      if (data.series.length && range) {
        // for dates, draw the blue area to the end of the day
        const rightCoordinate =
          data.binWidthSlider?.valueType === 'number'
            ? range.max
            : DateMath.add(new Date(range.max), 0.9999, 'day').toISOString();
        return [
          {
            type: 'rect',
            ...(orientation === 'vertical'
              ? {
                  xref: 'x',
                  yref: 'paper',
                  x0: range.min,
                  x1: rightCoordinate,
                  y0: 0,
                  y1: 1,
                }
              : {
                  xref: 'paper',
                  yref: 'y',
                  x0: 0,
                  x1: 1,
                  y0: range.min,
                  y1: rightCoordinate,
                }),
            line: {
              color: 'blue',
              width: 1,
            },
            fillcolor: 'lightblue',
            opacity: 0.4,
          },
        ];
      } else {
        return [];
      }
    }, [selectingRange, selectedRange, orientation, data.series]);

    const standardIndependentAxisRange: NumberOrDateRange | undefined =
      useMemo(() => {
        if (binSummaries.length === 0) return undefined;

        // If independentAxisRange (x-axis) is provided
        // adjust the min of the range to the binStart of the bin that contains that value.
        // Likewise, adjust the max of the range to the binEnd of the bin that contains it.
        // This avoids partial bins being displayed.
        return {
          min:
            independentAxisRange?.min != null
              ? (
                  findLast(binSummaries, (bs) =>
                    binStartType === 'inclusive'
                      ? independentAxisRange?.min >= bs.binStart
                      : independentAxisRange?.min > bs.binStart
                  ) ?? { binStart: independentAxisRange?.min }
                )?.binStart
              : first(binSummaries)?.binStart,
          max:
            independentAxisRange?.max != null
              ? (
                  find(binSummaries, (bs) =>
                    binEndType === 'inclusive'
                      ? independentAxisRange?.max <= bs.binEnd
                      : independentAxisRange?.max < bs.binEnd
                  ) ?? { binEnd: independentAxisRange?.max }
                )?.binEnd
              : last(binSummaries)?.binEnd,
        } as NumberOrDateRange;
      }, [
        data?.binWidthSlider?.valueType,
        independentAxisRange,
        binSummaries,
        binStartType,
        binEndType,
      ]);

    // truncation axis range
    const extendedIndependentAxisRange = extendAxisRangeForTruncations(
      standardIndependentAxisRange,
      axisTruncationConfig?.independentAxis,
      data.binWidthSlider?.valueType
    );

    const plotlyIndependentAxisRange = [
      extendedIndependentAxisRange?.min,
      extendedIndependentAxisRange?.max,
    ];

    // somewhat elaborate calculation of the number of bins that would span
    // the independent axis. Used for plotly `nticks` customisation.
    // `binSummaries.length` isn't appropriate
    // because it doesn't include zero count bins, however, we only need to calculate `numBins`
    // if `binSummaries.length` is less than the threshold we're using for nticks
    // so that cuts down a bit on calculations
    const numBins = useMemo(() => {
      if (
        standardIndependentAxisRange == null ||
        binSummaries.length === 0 ||
        binSummaries.length > SMALL_NUMBER_OF_BINS
      )
        return undefined;

      // take the first bin as a representative
      const bin = binSummaries[0];
      if (data.binWidthSlider?.valueType === 'date') {
        const range = standardIndependentAxisRange as DateRange;
        return Math.ceil(
          DateMath.diff(
            new Date(range.min),
            new Date(range.max),
            'seconds',
            false
          ) /
            DateMath.diff(
              new Date(bin.binStart as string),
              new Date(bin.binEnd as string),
              'seconds',
              false
            )
        );
      } else {
        const range = standardIndependentAxisRange as NumberRange;
        return Math.ceil(
          (range.max - range.min) /
            ((bin.binEnd as number) - (bin.binStart as number))
        );
      }
    }, [binSummaries, standardIndependentAxisRange]);

    const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
      type: data?.binWidthSlider?.valueType === 'date' ? 'date' : 'linear',
      automargin: true,
      showgrid: false,
      zeroline: false,
      showline: !axisTruncationConfig?.dependentAxis?.min,
      title: {
        text: independentAxisLabel,
      },
      range: plotlyIndependentAxisRange,
      tickfont: data.series.length ? {} : { color: 'transparent' },
      linecolor: '#dddddd',
      // if there is a tiny number of bins, make sure we don't
      // provide more tick labels than bins (e.g. 0, 0.5, 1, 1.5, 2 when there are just two bins, 0-1, 1-2)
      nticks:
        numBins != null && numBins <= SMALL_NUMBER_OF_BINS
          ? numBins + 1
          : undefined,
      ...tickSettings(
        false,
        extendedIndependentAxisRange,
        data?.binWidthSlider?.valueType
      ),
    };

    // if at least one bin.count is 0 < x < 1 then these are probably fractions/proportions
    // affects mouseover formatting only in logScale mode
    // worst case is that mouseovers contain integers followed by .0000
    const dataLooksFractional = useMemo(() => {
      return some(
        data.series.flatMap((series) => series.bins.map((bin) => bin.value)),
        (val) => val > 0 && val < 1
      );
    }, [data.series]);

    const standardDependentAxisRange = dependentAxisRange;

    // truncation axis range
    const extendedDependentAxisRange = extendAxisRangeForTruncations(
      standardDependentAxisRange,
      axisTruncationConfig?.dependentAxis,
      'number',
      // set plot type not to have padding/margin on the min/max
      false,
      dependentAxisLogScale
    ) as NumberRange | undefined;

    // make rectangular layout shapes for truncated axis/missing data
    const truncatedAxisHighlighting: Partial<Shape>[] | undefined =
      useMemo(() => {
        if (data.series.length > 0) {
          const filteredTruncationLayoutShapes = truncationLayoutShapes(
            orientation,
            standardIndependentAxisRange,
            standardDependentAxisRange,
            extendedIndependentAxisRange,
            extendedDependentAxisRange,
            axisTruncationConfig
          );

          return filteredTruncationLayoutShapes;
        } else {
          return [];
        }
      }, [
        standardIndependentAxisRange,
        standardDependentAxisRange,
        extendedIndependentAxisRange,
        extendedDependentAxisRange,
        orientation,
        data.series,
        axisTruncationConfig,
      ]);

    const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
      type: dependentAxisLogScale ? 'log' : 'linear',
      hoverformat: dependentAxisLogScale
        ? dataLooksFractional
          ? ',.4f'
          : ',.0f'
        : undefined,
      automargin: true,
      title: {
        text: dependentAxisLabel,
      },
      // range should be an array
      // with the truncated axis, negative values need to be checked for log scale
      range: data.series.length
        ? [
            extendedDependentAxisRange?.min,
            extendedDependentAxisRange?.max,
          ].map((val) =>
            dependentAxisLogScale && val != null
              ? val <= 0
                ? -0.1 // for count's logscale
                : Math.log10(val as number)
              : val
          )
        : [0, 10],
      tickfont: data.series.length ? {} : { color: 'transparent' },
      showline: !axisTruncationConfig?.independentAxis?.min,
      linecolor: '#dddddd',
      zeroline: false,
      ...tickSettings(
        dependentAxisLogScale,
        extendedDependentAxisRange,
        data?.binWidthSlider?.valueType
      ),
    };

    return {
      useResizeHandler: true,
      layout: {
        // add truncatedAxisHighlighting for layout.shapes
        shapes: [...selectedRangeHighlighting, ...truncatedAxisHighlighting],
        // when we implement zooming, we will still use Plotly's select mode
        dragmode: 'select',
        // with a histogram, we can always use 1D selection
        selectdirection: orientation === 'vertical' ? 'h' : 'v',
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
      },
      data: plotlyFriendlyData,
      onSelected: handleSelectedRange,
      onSelecting: handleSelectingRange,
      ...restProps,
    };
  }
);

export default Histogram;
