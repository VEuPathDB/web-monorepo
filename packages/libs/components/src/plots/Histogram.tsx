import React, { useEffect, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';

import { DARK_GRAY } from '../constants/colors';
import PlotlyPlot, { ModebarDefault, PlotProps } from './PlotlyPlot';
import { HistogramData } from '../types/plots';

export interface HistogramProps extends PlotProps {
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
  /** Fill color of the title, axes labels, and tick marks. Defaults to DARK_GRAY. */
  textColor?: string;
  /** Color of the gridlines. Use Plotly defaults if not specified. */
  gridColor?: string;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
  /** Should plot legend be displayed? */
  showLegend?: boolean;
  /** function to call upon selecting a range (in x and y axes) */
  onSelected?: () => void;
  /** Max value for the y-axis */
  yAxisRange?: [number, number];
  /** Show value for each bar */
  showBarValues?: boolean,
};

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
  onSelected = () => {},
  showLegend = true,
  margin,
  staticPlot,
  showModebar,
  yAxisRange,
  showBarValues,
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

        return {
          type: 'bar',
          x: orientation === 'vertical' ? binLabels : binCounts,
          y: orientation === 'vertical' ? binCounts : binLabels,
          opacity: calculatedBarOpacity,
          orientation: orientation === 'vertical' ? 'v' : 'h',
          name: series.name,
          text: showBarValues ? binCounts.map(String) : undefined,
          textposition: showBarValues ? 'auto' : undefined,
          ...(series.color ? { marker: { color: series.color } } : {}),
        };
      }),
    [data, orientation, calculatedBarOpacity]
  );

  return (
    <div>
      <PlotlyPlot
        useResizeHandler={true}
        revision={revision}
        style={{ height, width }}
        layout={{
          autosize: true,
          margin: margin || {
            pad: 5,
          },
          showlegend: showLegend,
          legend: {
            font: {
              color: textColor,
            },
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
        onSelected={onSelected}
        config={{
          displayModeBar: showModebar !== undefined ? showModebar : ModebarDefault,
          staticPlot: staticPlot,
        }}
      />
    </div>
  );
}
