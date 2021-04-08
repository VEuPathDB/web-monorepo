import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';

// Definitions
import { DARK_GRAY } from '../constants/colors';
import { HistogramData, HistogramBin } from '../types/plots';
import { NumberOrDate, NumberOrDateRange } from '../types/general';
import { PlotLegendAddon, PlotSpacingAddon } from '../types/plots/addOns';
import { legendSpecification } from '../utils/plotly';

// Libraries
import * as DateMath from 'date-arithmetic';

// Components
import PlotlyPlot from './PlotlyPlot';
import { Layout, Shape } from 'plotly.js';

// bin middles needed for highlighting
interface BinSummary {
  binStart: HistogramBin['binStart'];
  binEnd: HistogramBin['binEnd'];
  binMiddle: HistogramBin['binEnd'];
}

export interface HistogramProps {
  /** Data for the plot. */
  data: HistogramData;
  /** The width of the plot in pixels. */
  width: number;
  /** The height of the plot in pixels. */
  height: number;
  /** The orientation of the plot. Defaults to `vertical` */
  orientation: 'vertical' | 'horizontal';
  /** How bars are displayed when there are multiple series. */
  barLayout: 'overlay' | 'stack' | 'group';
  /** Opacity of bars. Range is a decimal between 0 and 1. Defaults to 1
   * if there is only one data series bars are not overlayed. Otherwise,
   * defaults to .75
   */
  opacity?: number;
  /** Title of plot. */
  title?: string;
  /** Label for independent axis. Defaults to `Bins`. */
  independentAxisLabel?: string;
  /** Label for dependent axis. Defaults to `Count`. */
  dependentAxisLabel?: string;
  /** Fill color of the title, axes labels, tick marks, and legend.
   * Defaults to DARK_GRAY. Note that textColor can be overridden
   * for the legend if `legendOptions` is provided. */
  textColor?: string;
  /** Color of the gridlines. Use Plotly defaults if not specified. */
  gridColor?: string;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
  /** Should plot legend be displayed? */
  displayLegend?: boolean;
  /** Options for customizing plot legend. */
  legendOptions?: PlotLegendAddon;
  /** Range for the dependent axis (usually y-axis) */
  // TO DO: rename to dependentAxisRange and
  //        change to NumberRange but affects quite a few files (e.g. map's ChartMarkers)
  yAxisRange?: [number, number];
  /** Show value for each bar */
  showBarValues?: boolean;
  /** Should plotting library controls be displayed? Ex. Plot.ly */
  displayLibraryControls?: boolean;
  /** Options for customizing plot placement. */
  spacingOptions?: PlotSpacingAddon;
  /** Whether the plot is interactive. If false, overrides
   * displayLibraryControls. */
  interactive?: boolean;
  /** A range to highlight by means of opacity */
  selectedRange?: NumberOrDateRange;
  /** function to call upon selecting a range (in independent axis) */
  onSelectedRangeChange?: (newRange: NumberOrDateRange) => void;
}

/** A Plot.ly based histogram component. */
export default function Histogram({
  data,
  width,
  height,
  orientation = 'vertical',
  title,
  independentAxisLabel = 'Bins',
  dependentAxisLabel = 'Count',
  textColor = DARK_GRAY,
  gridColor,
  opacity = 1,
  barLayout = 'overlay',
  backgroundColor = 'transparent',
  yAxisRange,
  showBarValues,
  displayLegend = true,
  legendOptions,
  displayLibraryControls = true,
  spacingOptions,
  interactive = true,
  selectedRange,
  onSelectedRangeChange = () => {},
}: HistogramProps) {
  const [revision, setRevision] = useState(0);

  // Quirk of Plot.ly library. If you don't do this, the
  // plot will not refresh on barLayout changes.
  useEffect(() => {
    setRevision(revision + 1);
  }, [barLayout]);

  /**
   * Determine bar opacity. This gets a little complicated
   * as we have to dynamically adjust an opacity of 1 down
   * when there is more than 1 data series and the layout
   * is overlay.
   */
  const calculatedBarOpacity: number = useMemo(() => {
    if (barLayout === 'overlay' && data.series.length > 1) {
      return opacity > 1 ? (opacity / 100) * 0.75 : opacity * 0.75;
    } else {
      return opacity > 1 ? opacity / 100 : opacity;
    }
  }, [barLayout, data.series.length, opacity]);

  /**
   * Calculate min binStart and max binEnd values
   */
  const minBinStart: NumberOrDate = useMemo(() => {
    return data.series
      .map((series) => series.bins[0].binStart)
      .sort((a: NumberOrDate, b: NumberOrDate) => a.valueOf() - b.valueOf())[0];
  }, [data.series]);
  const maxBinEnd: NumberOrDate = useMemo(() => {
    return data.series
      .map((series) => series.bins[series.bins.length - 1].binEnd)
      .sort((a: NumberOrDate, b: NumberOrDate) => b.valueOf() - a.valueOf())[0];
  }, [data.series]);

  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.series.map((series) => {
        const binStarts = series.bins.map((bin) => bin.binStart);
        const binLabels = series.bins.map((bin) => bin.binLabel); // see TO DO: below
        const binCounts = series.bins.map((bin) => bin.count);
        const binWidths = series.bins.map((bin) => {
          if (data.valueType !== undefined && data.valueType === 'date') {
            // date, needs to be in milliseconds
            // TO DO: bars seem very slightly too narrow at monthly resolution (multiplying by 1009 fixes it)
            return (
              DateMath.diff(
                bin.binStart as Date,
                bin.binEnd as Date,
                'seconds',
                false
              ) * 1000
            );
          } else {
            return (bin.binEnd as number) - (bin.binStart as number);
          }
        });
        return {
          type: 'bar',
          x: orientation === 'vertical' ? binStarts : binCounts,
          y: orientation === 'vertical' ? binCounts : binStarts,
          opacity: calculatedBarOpacity,
          orientation: orientation === 'vertical' ? 'v' : 'h',
          name: series.name,
          // text: binLabels, // TO DO: find a way to show concise bin labels
          text: showBarValues ? binCounts.map(String) : binLabels,
          textposition: showBarValues ? 'auto' : undefined,
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
    [data, orientation, calculatedBarOpacity, selectedRange]
  );

  /**
   * calculate midpoints of a unique set of bins
   */
  const binSummaries: BinSummary[] = useMemo(() => {
    const allBins: HistogramBin[] = data.series
      .map((series) => [series.bins])
      .flat(2);

    const seenLabels: string[] = [];
    const uniqueBins = allBins.filter((bin) => {
      const seenBefore = seenLabels.indexOf(bin.binLabel);
      seenLabels.push(bin.binLabel);
      return seenBefore < 0;
    });
    // sort them on binStart just in case
    uniqueBins.sort((bina, binb) =>
      bina.binStart > binb.binStart
        ? 1
        : bina.binStart === binb.binStart
        ? 0
        : -1
    );

    // return the list of summaries - note the binMiddle prop
    return uniqueBins.map((bin) => ({
      binStart: bin.binStart,
      binEnd: bin.binEnd,
      binMiddle:
        data.valueType === 'date'
          ? DateMath.add(
              bin.binStart as Date,
              DateMath.diff(
                bin.binStart as Date,
                bin.binEnd as Date,
                'seconds',
                false
              ) * 500,
              'milliseconds'
            )
          : ((bin.binStart as number) + (bin.binEnd as number)) / 2.0,
    }));
  }, [data.series, data.valueType]);

  // local state for range **while selecting** graphically
  const [selectingRange, setSelectingRange] = useState<NumberOrDateRange>();

  const handleSelectingRange = useCallback(
    (object: any) => {
      if (object && object.range) {
        const [val1, val2] =
          orientation === 'vertical' ? object.range.x : object.range.y;
        const [min, max] = val1 > val2 ? [val2, val1] : [val1, val2];
        // TO DO: think about time zones?
        const rawRange: NumberOrDateRange = {
          min: data.valueType === 'date' ? new Date(min) : min,
          max: data.valueType === 'date' ? new Date(max) : max,
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
    [data.valueType, orientation, binSummaries, setSelectingRange]
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
    if (range) {
      return [
        {
          type: 'rect',
          ...(orientation === 'vertical'
            ? {
                xref: 'x',
                yref: 'paper',
                x0: range.min,
                x1: range.max,
                y0: 0,
                y1: 1,
              }
            : {
                xref: 'paper',
                yref: 'y',
                x0: 0,
                x1: 1,
                y0: range.min,
                y1: range.max,
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
  }, [selectingRange, selectedRange, orientation]);

  const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
    type: data?.valueType === 'date' ? 'date' : 'linear',
    automargin: true,
    title: {
      text: independentAxisLabel,
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 14,
      },
    },
    color: textColor,
    range: [minBinStart, maxBinEnd],
  };
  const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
    type: 'linear',
    automargin: true,
    title: {
      text: dependentAxisLabel,
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 14,
      },
    },
    color: textColor,
    gridcolor: gridColor,
    range: yAxisRange || undefined,
  };

  return (
    <div>
      <PlotlyPlot
        useResizeHandler={true}
        revision={revision}
        style={{ height, width }}
        layout={{
          shapes: selectedRangeHighlighting,
          // when we implement zooming, we will still use Plotly's select mode
          dragmode: 'select',
          // with a histogram, we can always use 1D selection
          selectdirection: orientation === 'vertical' ? 'h' : 'v',
          autosize: true,
          margin: {
            t: spacingOptions?.marginTop,
            r: spacingOptions?.marginRight,
            b: spacingOptions?.marginBottom,
            l: spacingOptions?.marginLeft,
            pad: spacingOptions?.padding || 5,
          },
          showlegend: displayLegend,
          legend: {
            font: {
              color: textColor,
            },
            ...(legendOptions ? legendSpecification(legendOptions) : {}),
          },
          plot_bgcolor: backgroundColor,
          paper_bgcolor: backgroundColor,
          xaxis:
            orientation === 'vertical'
              ? independentAxisLayout
              : dependentAxisLayout,
          yaxis:
            orientation === 'vertical'
              ? dependentAxisLayout
              : independentAxisLayout,
          barmode: barLayout,
          title: {
            text: title,
            font: {
              family: 'Arial, Helvetica, sans-serif',
              color: textColor,
              size: 24,
            },
            xref: 'paper',
            x: 0,
          },
        }}
        data={plotlyFriendlyData}
        onSelected={handleSelectedRange}
        onSelecting={handleSelectingRange}
        config={{
          displayModeBar: displayLibraryControls ? 'hover' : false,
          staticPlot: !interactive,
          displaylogo: false,
          showTips: true, // shows 'double click to zoom out' help for new users
        }}
      />
    </div>
  );
}
