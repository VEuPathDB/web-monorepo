import React, { useEffect, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';

// Definitions
import { DARK_GRAY } from '../constants/colors';
import { HistogramData } from '../types/plots';
import { NumericRange } from '../types/general';
import { PlotLegendAddon, PlotSpacingAddon } from '../types/plots/addOns';
import { legendSpecification } from '../utils/plotly';

// Components
import PlotlyPlot from './PlotlyPlot';

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
  /** Range for the y-axis */
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
  selectedRange?: NumericRange; // TO DO: handle DateRange too
  /** function to call upon selecting a range (in independent axis) */
  onSelectedRangeChange?: (newRange: NumericRange) => void;
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
  let calculatedBarOpacity: number;
  if (barLayout === 'overlay' && data.series.length > 1) {
    calculatedBarOpacity =
      opacity > 1 ? (opacity / 100) * 0.75 : opacity * 0.75;
  } else {
    calculatedBarOpacity = opacity > 1 ? opacity / 100 : opacity;
  }

  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.series.map((series) => {
        const binLabels = series.bins.map((bin) => bin.binLabel);
        const binCounts = series.bins.map((bin) => bin.count);
        const perBarOpacity: number[] = series.bins.map((bin) => {
          if (
            selectedRange &&
            selectedRange.min !== undefined &&
            selectedRange.max !== undefined
          ) {
            if (
              bin.binStart >= selectedRange.min &&
              bin.binStart /* TO DO - ADD BIN WIDTH HERE or have bin.binEnd available */ <
                selectedRange.max
            ) {
              // it's complicated due to date/string values
              return calculatedBarOpacity;
            } else {
              return 0.2 * calculatedBarOpacity;
            }
          } else {
            return calculatedBarOpacity;
          }
        });
        return {
          type: 'bar',
          x: orientation === 'vertical' ? binLabels : binCounts,
          y: orientation === 'vertical' ? binCounts : binLabels,
          opacity: calculatedBarOpacity,
          orientation: orientation === 'vertical' ? 'v' : 'h',
          name: series.name,
          text: showBarValues ? binCounts.map(String) : undefined,
          textposition: showBarValues ? 'auto' : undefined,
          marker: {
            ...(series.color ? { color: series.color } : {}),
            opacity: perBarOpacity,
          },
        };
      }),
    [data, orientation, calculatedBarOpacity, selectedRange]
  );

  const handleSelectedRange = (object: any) => {
    if (object && object.range) {
      // range reported by Plotly is in ordinal "bar index space" e.g. four bars would be 0 to 3
      // so we need to convert it to actual data space using the longest series of the data.
      const [ordinalMin, ordinalMax] =
        orientation === 'vertical' ? object.range.x : object.range.y;
      // do some rounding to get the indices of the first and last bar
      const firstBarIndex = Math.floor(ordinalMin + 1);
      const lastBarIndex = Math.floor(ordinalMax);
      // TO DO: can use data.series[0] because all series are guaranteed to have the same bins...
      // (but Storybook test api data does not)
      const seriesLengths = data.series.map((series) => series.bins.length);
      const longestSeriesLength = seriesLengths.sort((a: number, b: number) =>
        Math.sign(b - a)
      )[0];
      const longestSeries = data.series.filter(
        (series) => series.bins.length == longestSeriesLength
      );
      const min = Number(longestSeries[0].bins[firstBarIndex].binStart);
      const split = longestSeries[0].bins[lastBarIndex].binLabel.split(' '); // NASTY split on binLabel (BM)
      const max = Number(split[split.length - 1]);
      // call the callback prop
      onSelectedRangeChange({ min, max });
    }
  };

  return (
    <div>
      <PlotlyPlot
        useResizeHandler={true}
        revision={revision}
        style={{ height, width }}
        layout={{
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
          xaxis: {
            type: orientation === 'vertical' ? 'category' : 'linear',
            automargin: true,
            title: {
              text:
                orientation === 'vertical'
                  ? independentAxisLabel
                  : dependentAxisLabel,
              font: {
                family: 'Arial, Helvetica, sans-serif',
                size: 14,
              },
            },
            color: textColor,
          },
          yaxis: {
            automargin: true,
            title: {
              text:
                orientation === 'vertical'
                  ? dependentAxisLabel
                  : independentAxisLabel,
              font: {
                family: 'Arial, Helvetica, sans-serif',
                size: 14,
              },
            },
            color: textColor,
            gridcolor: gridColor,
            range: yAxisRange || undefined,
          },
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
