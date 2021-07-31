import React, { useCallback, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';

// Definitions
import {
  HistogramData,
  HistogramBin,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
  BarLayoutAddon,
  DependentAxisLogScaleAddon,
  DependentAxisLogScaleDefault,
} from '../types/plots';
import { NumberOrDate, NumberOrDateRange, NumberRange } from '../types/general';

// Libraries
import * as DateMath from 'date-arithmetic';
import { sortBy, sortedUniqBy, orderBy } from 'lodash';

// Components
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { Layout, Shape } from 'plotly.js';

// bin middles needed for highlighting
interface BinSummary {
  binStart: HistogramBin['binStart'];
  binEnd: HistogramBin['binEnd'];
  binMiddle: HistogramBin['binEnd'];
}

const EmptyHistogramData: HistogramData = { series: [] };

export interface HistogramProps
  extends PlotProps<HistogramData>,
    OrientationAddon,
    OpacityAddon,
    BarLayoutAddon<'overlay' | 'stack'>,
    DependentAxisLogScaleAddon {
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
   *  Used to keep graphical range selections within the range of the data. Optional. */
  selectedRangeBounds?: NumberOrDateRange; // TO DO: handle DateRange too
  /** Relevant to range selection - flag to indicate if the data is zoomed in. Default false. */
  isZoomed?: boolean;
  /** independent axis range min and max (this will be widened to include data if needed) */
  independentAxisRange?: NumberOrDateRange;
  /** if true (default false), adjust binEnds to the end of the day */
  adjustBinEndToEndOfDay?: boolean;
}

/** A Plot.ly based histogram component. */
export default function Histogram({
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
  adjustBinEndToEndOfDay = false,
  ...restProps
}: HistogramProps) {
  /**
   * Determine bar opacity. Only applicable when in overlay
   * mode and there are >1 series.
   * Values less than 0.75 recommended to avoid it looking like a stacked chart.
   * If providing an opacity slider, don't let values go higher than 0.75.
   */
  const calculatedBarOpacity: number = useMemo(() => {
    return barLayout === 'overlay' && data.series.length > 1 ? opacity : 1;
  }, [barLayout, data.series.length, opacity]);

  /**
   * Calculate min binStart and max binEnd values
   */
  const minBinStart: NumberOrDate = useMemo(() => {
    return data.series.length > 0
      ? orderBy(
          data.series.flatMap((series) => series.bins),
          [(bin) => bin.binStart],
          'asc'
        )[0].binStart
      : 0;
  }, [data.series]);
  const maxBinEnd: NumberOrDate = useMemo(() => {
    return data.series.length > 0
      ? orderBy(
          data.series.flatMap((series) => series.bins),
          [(bin) => bin.binEnd],
          'desc'
        )[0].binEnd
      : 10;
  }, [data.series]);

  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.series.map((series) => {
        const binStarts = series.bins.map((bin) => bin.binStart);
        const binLabels = series.bins.map((bin) => bin.binLabel); // see TO DO: below
        const binCounts = series.bins.map((bin) => bin.count);
        const binWidths = series.bins.map((bin) => {
          if (data.valueType != null && data.valueType === 'date') {
            // date, needs to be in milliseconds
            // TO DO: bars seem very slightly too narrow at monthly resolution (multiplying by 1009 fixes it)
            return (
              DateMath.diff(
                new Date(bin.binStart as string),
                adjustBinEndToEndOfDay
                  ? DateMath.endOf(new Date(bin.binEnd as string), 'day')
                  : new Date(bin.binEnd as string),
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
          // text: binLabels, // TO DO: find a way to show concise bin labels
          text: showValues ? binCounts.map(String) : binLabels,
          textposition: showValues ? 'auto' : undefined,
          marker: {
            ...(series.color ? { color: series.color } : {}),
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
        };
      }),
    [
      data,
      orientation,
      calculatedBarOpacity,
      selectedRange,
      showValues,
      adjustBinEndToEndOfDay,
    ]
  );

  /**
   * calculate midpoints of a unique set of bins
   */
  const binSummaries: BinSummary[] = useMemo(() => {
    const allBins: HistogramBin[] = data.series.flatMap(
      (series) => series.bins
    );

    const sortedBins = sortBy(allBins, (bin) => bin.binStart);
    const uniqueBins = sortedUniqBy(sortedBins, (bin) => bin.binLabel);

    // return the list of summaries - note the binMiddle prop
    return uniqueBins.map((bin, index) => ({
      binStart:
        // The first bin's binStart can outside the allowed range bounds.
        // If we are not zoomed in, adjust the first bin's binStart to
        // selectedRangeBounds.min if needed
        index === 0 &&
        selectedRangeBounds?.min != null &&
        (!isZoomed || selectedRangeBounds.min > bin.binStart)
          ? selectedRangeBounds.min
          : bin.binStart,
      binEnd:
        // do similar for the last bin and binEnd
        index === uniqueBins.length - 1 &&
        selectedRangeBounds?.max != null &&
        (!isZoomed || selectedRangeBounds.max < bin.binEnd)
          ? selectedRangeBounds.max
          : bin.binEnd,
      binMiddle:
        data.valueType === 'date'
          ? DateMath.add(
              new Date(bin.binStart as string),
              DateMath.diff(
                new Date(bin.binStart as string),
                adjustBinEndToEndOfDay
                  ? DateMath.endOf(new Date(bin.binEnd as string), 'day')
                  : new Date(bin.binEnd as string),
                'seconds',
                false
              ) * 500,
              'milliseconds'
            ).toISOString()
          : ((bin.binStart as number) + (bin.binEnd as number)) / 2.0,
    }));
  }, [
    data.series,
    data.valueType,
    isZoomed,
    selectedRangeBounds,
    adjustBinEndToEndOfDay,
  ]);

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
        const rightBin = binSummaries
          .slice()
          .reverse()
          .find((bin) => rawRange.max > bin.binMiddle);
        if (leftBin && rightBin && leftBin.binStart <= rightBin.binStart) {
          setSelectingRange({
            min: leftBin.binStart,
            max: rightBin.binEnd,
          } as NumberOrDateRange);
        } else {
          setSelectingRange(undefined);
        }
      }
    },
    [orientation, binSummaries]
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
        data.valueType === 'number'
          ? range.max
          : adjustBinEndToEndOfDay
          ? DateMath.endOf(new Date(range.max), 'day').toISOString()
          : range.max;
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
  }, [
    selectingRange,
    selectedRange,
    orientation,
    data.series,
    adjustBinEndToEndOfDay,
  ]);

  const plotlyIndependentAxisRange = useMemo(() => {
    // here we ensure that no data bins are excluded/hidden from view
    const range = [
      independentAxisRange && independentAxisRange.min < minBinStart
        ? independentAxisRange.min
        : minBinStart,
      independentAxisRange && independentAxisRange?.max > maxBinEnd
        ? independentAxisRange.max
        : maxBinEnd,
    ];
    // extend date-based range.max to the end of the day
    // (this also avoids excluding a the final bin if binWidth=='day')
    if (data?.valueType === 'date') {
      return [
        range[0],
        adjustBinEndToEndOfDay
          ? DateMath.endOf(new Date(range[1]), 'day').toISOString()
          : range[1],
      ];
    } else {
      return range;
    }
  }, [
    data?.valueType,
    independentAxisRange,
    minBinStart,
    maxBinEnd,
    adjustBinEndToEndOfDay,
  ]);

  const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
    type: data?.valueType === 'date' ? 'date' : 'linear',
    automargin: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    title: {
      text: independentAxisLabel,
    },
    range: plotlyIndependentAxisRange,
    tickfont: data.series.length ? {} : { color: 'transparent' },
  };
  const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
    type: dependentAxisLogScale ? 'log' : 'linear',
    tickformat: ',.1r', // comma-separated thousands, rounded to 1 significant digit
    automargin: true,
    title: {
      text: dependentAxisLabel,
    },
    // range should be an array
    range: data.series.length
      ? [dependentAxisRange?.min, dependentAxisRange?.max].map((val) =>
          dependentAxisLogScale && val != null ? Math.log10(val || 1) : val
        )
      : [0, 10],
    dtick: dependentAxisLogScale ? 1 : undefined,
    tickfont: data.series.length ? {} : { color: 'transparent' },
    showline: true,
  };

  return (
    <PlotlyPlot
      useResizeHandler={true}
      layout={{
        shapes: selectedRangeHighlighting,
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
      }}
      data={plotlyFriendlyData}
      onSelected={handleSelectedRange}
      onSelecting={handleSelectingRange}
      {...restProps}
    />
  );
}
