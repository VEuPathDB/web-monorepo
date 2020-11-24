import React, { useMemo } from 'react';
import { PlotParams } from 'react-plotly.js';
import { DateTime } from 'luxon';

import { DARK_GRAY } from '../constants/colors';
import PlotlyPlot from './PlotlyPlot';

/**
 * Steps
 * 1. Come up with a reasonable representation of pre-binned data.
 * Ideally this would be able to drop into a bar chart.
 */

export type HistogramData = Array<{
  seriesName: string;
  seriesColor: string;
  data: HistogramBin[];
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
  orientation: 'vertical' | 'horizontal';
  /** How bars are displayed when there are multiple series. */
  barMode: 'overlay' | 'group' | 'stack';
  /** Title of plot. */
  title?: string;
  /** Fill color of the title, axes labels, and tick marks.
   * Defaults to DARK_GRAY.
   */
  textColor?: string;
  /** Color of the gridlines. Use Plotly defaults if not specified. */
  gridColor?: string;
  /** Opacity of bars. Range is a decimal between 0 and 1. Defaults to 1
   * if there is only one data series bars are not overlayed. Otherwise,
   * defaults to .75
   */
  barOpacity?: number;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
};

export default function Histogram({
  data,
  width,
  height,
  orientation = 'vertical',
  title,
  textColor = DARK_GRAY,
  gridColor,
  barOpacity,
  barMode = 'overlay',
  backgroundColor = 'transparent',
}: HistogramProps) {
  // Determine bar opacity.
  const calculatedBarOpacity = barOpacity
    ? barOpacity
    : data.length === 1 || barMode !== 'overlay'
    ? 1
    : 0.75;

  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.map((series) => {
        const binLabels = series.data.map(binLabel);
        const binCounts = series.data.map((bin) => bin.count);

        return {
          type: 'bar',
          x: orientation === 'vertical' ? binLabels : binCounts,
          y: orientation === 'vertical' ? binCounts : binLabels,
          opacity: calculatedBarOpacity,
          orientation: orientation === 'vertical' ? 'v' : 'h',
          name: series.seriesName,
          ...(series.seriesColor
            ? { marker: { color: series.seriesColor } }
            : {}),
        };
      }),
    [data, orientation]
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
          type: orientation === 'vertical' ? 'category' : 'linear',
          title: {
            text: orientation === 'vertical' ? 'Bins' : 'Count',
            font: {
              family: 'Arial, Helvetica, sans-serif',
              size: 14,
            },
          },
          color: textColor,
        },
        yaxis: {
          title: {
            text: orientation === 'vertical' ? 'Count' : 'Bins',
            font: {
              family: 'Arial, Helvetica, sans-serif',
              size: 14,
            },
          },
          color: textColor,
          gridcolor: gridColor,
        },
        barmode: barMode,
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

// type SupportedDataTypes = 'number' | 'date';
// type UserDataTypeToNativeType<T extends SupportedDataTypes> = T extends 'number'
//   ? number
//   : T extends 'date'
//   ? string
//   : never;

// interface Props<T extends 'number' | 'date'> {
//   // This can be used by the component if special logic is required based on type
//   // E.g., if `date`, will need `layout.xaxis.type = date`
//   dataType: T;

//   // Data, as an array. See `props.layout` for display options
//   data: Array<{
//     series: Array<{
//       binStart: UserDataTypeToNativeType<T>;
//       // defaults to something like "{binStart} - {binStart + binWidth}"
//       binLabel?: string;
//     }>;
//     color?: string;
//   }>;

//   // stacked bars vs overlayed plots
//   layout: 'stack' | 'overlay';

//   // If this is not provided, it should be inferred from the data. We can just let plotly figure this out.
//   //   defaultYAxisRange?: [T, T];
//   //   onYAxisRangeChange: (range: [T, T]) => void;

//   // Controls direction of bars
//   defaultOrientation?: 'vertical' | 'horizontal';

//   // Controls opacity of bars, gobally
//   defaultOpacity?: number;

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
