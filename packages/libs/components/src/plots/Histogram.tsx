import React, { useEffect, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';
import { DateTime } from 'luxon';

import { DARK_GRAY } from '../constants/colors';
import PlotlyPlot from './PlotlyPlot';
import { action } from '@storybook/addon-actions'; // BM: temp/debugging - should not depend on storybook here!
import { HistogramBin, HistogramData } from '../types/plots';

/**
 * Determine the label for a given HistogramBin. 
 * 
 * If a `binLabel` is specified on the bin itself, that is used.
 * Otherwise one is generated. Note that this does NOT currently support
 * date based bin labels.

 * @param bin The bin for which to derive the label.
 * @param binWidth The currently selected binWidth.
 */
const binLabel = (bin: HistogramBin, binWidth: number) => {
  if (bin.binLabel) {
    return bin.binLabel;
  }

  // TODO: This doesn't work for date based labels since we don't know the possible range of availableUnits to perform calculations with.

  switch (typeof bin.binStart) {
    case 'string':
      return `Unsupported Bin Label.`;
    case 'number':
      return `${bin.binStart} - ${bin.binStart + binWidth}`;
    default:
      return `Unsupported Bin Label.`;
  }

  // if (typeof bin.binStart === 'string') {
  //   const binStartAsDate = DateTime.fromISO(bin.binStart);
  //   const binEndAsDate = DateTime.fromISO(bin.binEnd as string);

  //   if (binStartAsDate.isValid) {
  //     return binEndAsDate.isValid
  //       ? `${binStartAsDate.toLocaleString(
  //           DateTime.DATE_MED
  //         )}<br>to<br>${binEndAsDate.toLocaleString(DateTime.DATE_MED)}`
  //       : `${binStartAsDate.toLocaleString(DateTime.DATE_MED)}`;
  //   } else {
  //     return bin.binEnd ? `${bin.binStart} - ${bin.binEnd}` : `${bin.binStart}`;
  //   }
  // }
};

export type HistogramProps = {
  /** Data for the plot. */
  data: HistogramData;
  /** Currently selected binWidth. */
  binWidth: number;
  /** The width of the plot in pixels. */
  width: number;
  /** The height of the plot in pixels. */
  height: number;
  /** The orientation of the plot. Defaults to `vertical` */
  orientation: 'vertical' | 'horizontal';
  /** How bars are displayed when there are multiple series. */
  layout: 'overlay' | 'stack' | 'group';
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
  opacity: number;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
};

/** A Plot.ly based histogram component. */
export default function Histogram({
  data,
  binWidth,
  width,
  height,
  orientation = 'vertical',
  title,
  independentAxisLabel = 'Bins',
  dependentAxisLabel = 'Count',
  textColor = DARK_GRAY,
  gridColor,
  opacity = 1,
  layout = 'overlay',
  backgroundColor = 'transparent',
}: HistogramProps) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setRevision(revision + 1);
  }, [layout]);

  /**
   * Determine bar opacity. This gets a little complicated
   * as we have to dynamically adjust an opacity of 1 down
   * when there is more than 1 data series and the layout
   * is overlay.
   */
  console.log(opacity);
  let calculatedBarOpacity: number;
  if (layout === 'overlay' && data.length > 1) {
    calculatedBarOpacity =
      opacity > 1 ? (opacity / 100) * 0.75 : opacity * 0.75;
  } else {
    calculatedBarOpacity = opacity > 1 ? opacity / 100 : opacity;
  }

  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.map((series) => {
        const binLabels = series.bins.map((bin) => binLabel(bin, binWidth));
        const binCounts = series.bins.map((bin) => bin.count);

        return {
          type: 'bar',
          x: orientation === 'vertical' ? binLabels : binCounts,
          y: orientation === 'vertical' ? binCounts : binLabels,
          opacity: calculatedBarOpacity,
          orientation: orientation === 'vertical' ? 'v' : 'h',
          name: series.name,
          ...(series.color ? { marker: { color: series.color } } : {}),
        };
      }),
    [data, orientation, binWidth, calculatedBarOpacity]
  );

  return (
    <PlotlyPlot
      revision={revision}
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
      onSelected={action('made a selection')}
    />
  ); // BM onSelected is debug only
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
