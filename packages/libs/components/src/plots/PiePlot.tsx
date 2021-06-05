import React from 'react';
import { PlotData as PlotlyPlotData } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';
import PlotlyPlot from './PlotlyPlot';
import CircularProgress from '@material-ui/core/CircularProgress';

import defaultColorGen from '../utils/defaultColorGen';
import { PiePlotData, PiePlotDatum } from '../types/plots';
import { DARK_GRAY, MEDIUM_GRAY } from '../constants/colors';
import { PlotLegendAddon, PlotSpacingAddon } from '../types/plots/addOns';
import { legendSpecification } from '../utils/plotly';

export interface PlotData extends Omit<PlotlyPlotData, 'hoverinfo'> {
  hoverinfo: PlotlyPlotData['hoverinfo'] | PlotlyPlotData['textinfo'];
  sort: boolean;
  texttemplate: string | string[];
}

export type PiePlotProps = {
  /** Data for the plot. */
  data: PiePlotData;
  /** The width of the plot in pixels. */
  width: number;
  /** The height of the plot in pixels. */
  height: number;
  /** Title of plot. */
  title?: string;
  /** Plot opacity as a decimal (representing percentage). Defaults to 1. */
  opacity?: number;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
  /** Should plotting library controls be displayed? Ex. Plot.ly */
  displayLibraryControls?: boolean;
  /** Display pop-up with extra slice information on hover.
   * Defaults to false. */
  showHoverInfo?: boolean;
  /** Should plot legend be displayed? */
  displayLegend?: boolean;
  /** Options for customizing plot legend. */
  legendOptions?: PlotLegendAddon;
  /** Options for customizing plot placement. */
  spacingOptions?: PlotSpacingAddon;
  /** Extra specification for "donut" plot variation. */
  donutOptions?: {
    /** Percentage of the plot to cut out. */
    size: number;
    /** Color of cut out. */
    backgroundColor?: string;
    /** Text to place in center of donut. */
    text?: string;
    /** Color of donut text. */
    textColor?: string;
    /** Size of donut text. */
    fontSize?: string | number;
  };
  /** Optional spec for addition control of slice text. */
  textOptions?: {
    /** An array of strings to override or supplement the data
     * received from the API.*/
    sliceOverrides?: string[];
    /** What pieces of text data to display for each Pie slice.
     * Note that the values here are Plot.ly dependent. */
    displayOption?: PlotData['textinfo'];
    /** Whether text data should be display inside or outside of a
     * slice. Auto and none are also accepted options. */
    displayPosition?: 'inside' | 'outside' | 'auto' | 'none';
    /** A rather confusing Plot.ly specific prop that can, in theory, be used to
     * format slice values. https://plotly.com/javascript/reference/pie/#pie-texttemplate
     * */
    displayTemplate?: string | string[];
  };
  /** Show a loading spinner on top of the plot */
  showSpinner?: boolean;
};

/** A Plot.ly based Pie plot. */
export default function PiePlot({
  data,
  width,
  height,
  opacity = 1,
  displayLegend = true,
  displayLibraryControls = true,
  title,
  backgroundColor = 'transparent',
  showHoverInfo = false,
  legendOptions,
  donutOptions,
  textOptions,
  spacingOptions,
  showSpinner,
}: PiePlotProps) {
  const defaultColorIter = defaultColorGen();
  let newData: Partial<PlotData>[] = [];

  // Set some initial PLot.ly "layout" properties.
  let layout: PlotParams['layout'] = {
    legend: {
      font: {
        color: legendOptions?.font?.color ?? MEDIUM_GRAY,
        size: legendOptions?.font?.size,
        family: legendOptions?.font?.family ?? 'Helvetica, Arial, sans-serif',
      },
    },
  };

  if (legendOptions) {
    Object.assign(layout.legend, legendSpecification(legendOptions));
  }

  /**
   * Adding a donut to a plot.ly pie chart is
   * unexpectedly complicated. There are a number
   * of steps involved.
   */
  if (donutOptions) {
    if (donutOptions.text) {
      Object.assign(layout, {
        annotations: [
          {
            font: {
              size: donutOptions.fontSize || 12,
              color: donutOptions.textColor || MEDIUM_GRAY,
            },
            showarrow: false,
            text: donutOptions.text,
            x: 0.5,
            y: 0.5,
          },
        ],
      });
    }

    // The width of the donut. This is measured along invisible axes that seem
    // to exist in plotly even for a pie chart. It seems like the left side of
    // the pie chart starts at 0 on the x axis and the right side of the chart
    // ends at 1. The middle of the pie is at 0.5 x,y.
    const donutWidth = 0.5 * (1 - donutOptions.size);

    // To implement the donut hole background color, we add a feaux data trace
    // inside the hole with no markings
    const feauxDataTrace: Partial<PlotData> = {
      type: 'pie',
      values: [1],
      marker: {
        colors: [donutOptions.backgroundColor ?? 'transparent'],
      },
      // Where this data trace should be "plotted" on the "axes".
      // This places it in the center of the donut.
      // TODO: I'm not sure this is needed. Deprecated.
      // domain: {
      //   x: [donutWidth, 1 - donutWidth],
      //   y: [donutWidth, 1 - donutWidth],
      // },
      opacity: 1,
      hoverinfo: 'none',
      textinfo: 'none',
      showlegend: false,
    };

    newData.push(feauxDataTrace);
  }

  // Preprocess data for PlotlyPlot
  const reducer = (
    reducedData: {
      values: number[];
      labels: string[];
      marker: { colors: string[] };
    },
    currentData: PiePlotDatum
  ) => {
    reducedData.values.push(currentData.value);
    reducedData.labels.push(currentData.label);

    // Use the provided color or the next default plotly color if none is provided
    let color = currentData.color || (defaultColorIter.next().value as string);
    reducedData.marker.colors.push(color);

    return reducedData;
  };

  const primaryDataTrace: Partial<PlotData> = {
    type: 'pie',
    opacity,
    ...data.slices.reduce(reducer, {
      values: [],
      labels: [],
      marker: { colors: [] },
    }),
    hole: donutOptions?.size,
    direction: 'clockwise',
    sort: false,
    text: textOptions?.sliceOverrides,
    textinfo: textOptions?.displayOption,
    textposition: textOptions?.displayPosition,
    texttemplate: textOptions?.displayTemplate,
    hoverinfo: showHoverInfo ? 'label+value+percent' : 'none',
  };

  newData.push(primaryDataTrace);

  return (
    <div style={{ position: 'relative' }}>
      <PlotlyPlot
        // Type definitions from Plot.ly library are out of date.
        // In order to avoid Typescript barfing, we have to perform this
        // casting.
        data={newData as PlotlyPlotData[]}
        layout={{
          ...layout,
          width: width,
          height: height,
          plot_bgcolor: backgroundColor,
          paper_bgcolor: backgroundColor,
          // SUPER GROSS, modebar is a valid attribute here, but not
          // correctly included in Plot.ly type definitoins.
          // @ts-ignore
          modebar: {
            bgcolor: 'white',
          },
          showlegend: displayLegend,
          title: {
            text: title,
            font: {
              family: 'Helvetica, Arial, sans-serif',
              color: DARK_GRAY,
              size: 24,
            },
            xref: 'paper',
            x: 0,
          },
          margin: {
            t: spacingOptions?.marginTop,
            r: spacingOptions?.marginRight,
            b: spacingOptions?.marginBottom,
            l: spacingOptions?.marginLeft,
            pad: spacingOptions?.padding,
          },
        }}
        config={{
          displayModeBar: displayLibraryControls,
          displaylogo: false,
        }}
      />
      {showSpinner && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress color={'secondary'} size={50} thickness={5} />
        </div>
      )}
    </div>
  );
}
