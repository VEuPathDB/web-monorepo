import React, { useMemo } from 'react';
import { PlotParams } from 'react-plotly.js';
import { DateTime } from 'luxon';

import { DARK_GRAY } from '../constants/colors';
import PlotlyPlot from './PlotlyPlot';

export type HistogramData = Array<{
  name: string;
  color: string;
  bins: HistogramBin[];
}>;

type HistogramBin = {
  binStart: number | string;
  binEnd?: number | string;
  count: number;
};

/** Determine the appropriate label for the bin.
 * Note that there is some complicated logic here due to parsing potential
 * date strings as binStart/binEnd values.
 */
const binLabel = (bin: HistogramBin) => {
  if (typeof bin.binStart === 'string') {
    const binStartAsDate = DateTime.fromISO(bin.binStart);
    const binEndAsDate = DateTime.fromISO(bin.binEnd as string);

    if (binStartAsDate.isValid) {
      return binEndAsDate.isValid
        ? `${binStartAsDate.toLocaleString(
            DateTime.DATE_MED
          )}<br>to<br>${binEndAsDate.toLocaleString(DateTime.DATE_MED)}`
        : `${binStartAsDate.toLocaleString(DateTime.DATE_MED)}`;
    } else {
      return bin.binEnd ? `${bin.binStart} - ${bin.binEnd}` : `${bin.binStart}`;
    }
  }

  return bin.binEnd ? `${bin.binStart} - ${bin.binEnd}` : `${bin.binStart}`;
};

export type HistogramProps = {
  /** Data for the plot */
  data: HistogramData;
  /** The width of the plot in pixels. */
  width: number;
  /** The height of the plot in pixels. */
  height: number;
  /** The orientation of the plot. Defaults to `vertical` */
  defaultOrientation: 'vertical' | 'horizontal';
  /** How bars are displayed when there are multiple series. */
  layout: 'overlay' | 'group' | 'stack';
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
  /** Opacity of bars. Range is a decimal between 0 and 1. Defaults to 1
   * if there is only one data series bars are not overlayed. Otherwise,
   * defaults to .75
   */
  defaultOpacity?: number;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
};

export default function Histogram({
  data,
  width,
  height,
  defaultOrientation = 'vertical',
  title,
  independentAxisLabel = 'Bins',
  dependentAxisLabel = 'Count',
  textColor = DARK_GRAY,
  gridColor,
  defaultOpacity,
  layout = 'overlay',
  backgroundColor = 'transparent',
}: HistogramProps) {
  // Determine bar opacity.
  const calculatedBarOpacity = defaultOpacity
    ? defaultOpacity
    : data.length === 1 || layout !== 'overlay'
    ? 1
    : 0.75;

  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.map((series) => {
        const binLabels = series.bins.map(binLabel);
        const binCounts = series.bins.map((bin) => bin.count);

        return {
          type: 'bar',
          x: defaultOrientation === 'vertical' ? binLabels : binCounts,
          y: defaultOrientation === 'vertical' ? binCounts : binLabels,
          opacity: calculatedBarOpacity,
          orientation: defaultOrientation === 'vertical' ? 'v' : 'h',
          name: series.name,
          ...(series.color ? { marker: { color: series.color } } : {}),
        };
      }),
    [data, defaultOrientation]
  );

  return (
    <PlotlyPlot
      style={{ height, width }}
      layout={{
        margin: {
          pad: 5,
        },
        legend: {
          font: {
            color: textColor,
          },
        },
        autosize: false,
        width: width,
        height: height,
        plot_bgcolor: backgroundColor,
        paper_bgcolor: backgroundColor,
        xaxis: {
          type: defaultOrientation === 'vertical' ? 'category' : 'linear',
          title: {
            text:
              defaultOrientation === 'vertical'
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
          title: {
            text:
              defaultOrientation === 'vertical'
                ? dependentAxisLabel
                : independentAxisLabel,
            font: {
              family: 'Arial, Helvetica, sans-serif',
              size: 14,
            },
          },
          color: textColor,
          gridcolor: gridColor,
        },
        barmode: layout,
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
    />
  );
}

//   // ----------------
//   // BACKEND CONTROLS
//   // ----------------
//   //
//   // component consumer is responsible for updating the data based on the settings

//   // bin width related props
//   binWidth: UserDataTypeToNativeType<T>;
//   //   onBinWidthChange: (width: UserDataTypeToNativeType<T>) => void;

//   // units related props
//   //   units: string[];
//   //   selectedUnits: string;
//   //   onUnitsChange: (units: string) => void;

//   // barSize related props
//   //   barSize: 'absolute' | 'proportional';
//   //   onBarSizeChange: (barSize: 'absolute' | 'proportional') => void;
// }
