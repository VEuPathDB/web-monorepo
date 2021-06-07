import { useEffect, useMemo, useState } from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { Datum, Layout } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';

export interface BoxplotProps extends Omit<PlotProps, 'width' | 'height'> {
  /** Data for the box plot */
  data: {
    /** x/y data */
    seriesX: string[] | number[];
    seriesY: number[];
    /** overlay variable details */
    overlayVariableDetails?: {
      variableId: string;
      entityId: string;
      value: string;
    };
  }[];
  /** The width of the plot in pixels (if number), or CSS length. */
  width?: number | string;
  /** The height of the plot in pixels (if number), or CSS length. */
  height?: number | string;
  /** x-axis label */
  independentAxisLabel?: string;
  /** y-axis label */
  dependentAxisLabel?: string;
  /** The orientation of the plot. Defaults to `vertical` */
  orientation?: 'vertical' | 'horizontal';
  /** display raw data (marker) */
  points?: 'outliers' | 'all' | 'suspectedoutliers';
  /** show mean value */
  showMean?: boolean;
  /** plot title */
  title?: string;
  /** raw data marker opacity */
  markerOpacity?: number;
  /** show plot legend */
  displayLegend?: boolean;
  /** show plotly's built-in controls */
  displayLibraryControls?: boolean;
  /** show/hide independent axis tick label */
  showIndependentAxisTickLabel?: boolean;
  /** show/hide dependent axis tick label */
  showDependentAxisTickLabel?: boolean;
}

export default function BoxplotEDA({
  data,
  width,
  height,
  orientation = 'vertical',
  points,
  // showRawData,
  showMean,
  independentAxisLabel,
  dependentAxisLabel,
  // defaultDependentAxisRange,
  markerOpacity = 0.75,
  margin,
  title,
  staticPlot,
  displayLegend,
  displayLibraryControls,
  showIndependentAxisTickLabel = true,
  showDependentAxisTickLabel = true,
}: BoxplotProps) {
  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.map((el: any) => {
        //DKDK check data exist
        if (el.seriesX && el.seriesY) {
          return {
            x: orientation === 'vertical' ? el.seriesX : el.seriesY,
            y: orientation === 'vertical' ? el.seriesY : el.seriesX,
            name: el.overlayVariableDetails.value
              ? el.overlayVariableDetails.value
              : 'Data', //DKDK legend name
            orientation: orientation === 'vertical' ? 'v' : 'h',
            boxpoints: points ? points : false,
            boxmean: showMean ? showMean : false,
            jitter: 0.1, // should be dependent on the number of datapoints...?
            marker: {
              opacity: markerOpacity,
            },
            type: 'box',
          };
        } else {
          return {};
        }
      }),
    [data, orientation]
  );

  // well this does not work correctly
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    setRevision(revision + 1);
  }, [showMean, points]);

  const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
    // type: data?.valueType === 'date' ? 'date' : 'linear',
    automargin: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    title: {
      text: independentAxisLabel ? independentAxisLabel : '',
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 14,
      },
    },
    range: data.length ? undefined : [0, 10],
    tickfont: data.length ? {} : { color: 'transparent' },
    // show/hide independent axis tick label
    showticklabels: showIndependentAxisTickLabel,
  };

  const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
    automargin: true,
    title: {
      text: dependentAxisLabel ? dependentAxisLabel : '',
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 14,
      },
    },
    // color: textColor,
    // gridcolor: gridColor,
    tickfont: data.length ? {} : { color: 'transparent' },
    range: data.length ? undefined : [0, 10],
    showline: true,
    // show/hide dependent axis tick label
    showticklabels: showDependentAxisTickLabel,
  };

  const layout: Partial<Layout> = {
    xaxis:
      orientation === 'vertical' ? independentAxisLayout : dependentAxisLayout,
    yaxis:
      orientation === 'vertical' ? dependentAxisLayout : independentAxisLayout,
    title: {
      text: title ? title : '',
    },
    boxmode: 'group',
  };

  return (
    <PlotlyPlot
      data={plotlyFriendlyData}
      revision={revision}
      style={{ width: width, height: height }}
      layout={{
        ...layout,
        ...{
          autosize: true,
          // width: width,
          // height: height,
          margin: margin ? margin : undefined,
          showlegend: displayLegend,
          selectdirection: orientation === 'vertical' ? 'h' : 'v',
        },
      }}
      config={{
        displayModeBar: displayLibraryControls ? 'hover' : false,
        staticPlot: staticPlot ? staticPlot : false,
      }}
    />
  );
}
