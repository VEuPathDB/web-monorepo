import { PlotData as PlotlyPlotData } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
// FIXME - confusing mix of imports from plotly and react-plotly
//         isn't PlotlyPlotData the same as PlotParams['data'] ?

import { PiePlotData, PiePlotDatum } from '../types/plots';
import { sum } from 'lodash';

// Plotly PlotData['hoverinfo'] definition lacks options that work
// for pie traces. These can be found in PlotData['textinfo']
// FIXME: fix upstream and/or patch in types/plotly-omissions.ts ?
export interface PlotData extends Omit<PlotlyPlotData, 'hoverinfo'> {
  hoverinfo: PlotlyPlotData['hoverinfo'] | PlotlyPlotData['textinfo'];
  sort: boolean;
  texttemplate: string | string[];
}

export interface PiePlotProps extends PlotProps<PiePlotData> {
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
    /** An array of strings to override the automatic slice text (e.g. from label, value and/or percent)
     * received from the API. Used for hover text too. Overrides displayOption.*/
    sliceTextOverrides?: string[];
    /** What pieces of text data to display for each Pie slice.
     * Use
     * */
    displayOption?: 'label' | 'value' | 'percent' | 'value+percent'; // add more combinations and options from PlotData['textinfo'] as needed
    /** Whether text data should be display inside or outside of a
     * slice. Auto and none are also accepted options. */
    displayPosition?: 'inside' | 'outside' | 'auto' | 'none';
    /** A rather confusing Plot.ly specific prop that can, in theory, be used to
     * format slice values. https://plotly.com/javascript/reference/pie/#pie-texttemplate
     * */
    displayTemplate?: string | string[];
  };
  /** If true, treat data as cumulative totals and adjust pie sizes appropriately */
  cumulative?: boolean;
}

const EmptyPieData: PiePlotData = { slices: [] };

/** A Plot.ly based Pie plot. */
const PiePlot = makePlotlyPlotComponent(
  'PiePlot',
  ({
    data = EmptyPieData,
    donutOptions,
    textOptions,
    cumulative,
    ...restProps
  }: PiePlotProps) => {
    let newData: Partial<PlotData>[] = [];

    // Set some initial PLot.ly "layout" properties.
    let layout: PlotParams['layout'] = {};

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
                size: donutOptions.fontSize,
                color: donutOptions.textColor,
              },
              showarrow: false,
              text: donutOptions.text,
              x: 0.5,
              y: 0.5,
            },
          ],
        });
      }

      // To implement the donut hole background color, we add a faux data trace
      // inside the hole with no markings
      const fauxDataTrace: Partial<PlotData> = {
        type: 'pie',
        values: [1],
        marker: {
          colors: [donutOptions.backgroundColor ?? 'transparent'],
        },
        opacity: 1,
        hoverinfo: 'none',
        textinfo: 'none',
        showlegend: false,
      };

      newData.push(fauxDataTrace);
    }

    // Preprocess data for PlotlyPlot
    const reducer = (
      reducedData: {
        values: number[];
        labels: string[];
        marker: { colors: string[] };
        cumulativeSum: number; // only used in cumulative mode
      },
      currentData: PiePlotDatum
    ) => {
      reducedData.values.push(
        currentData.value - (cumulative ? sum(reducedData.values) : 0)
      );
      reducedData.labels.push(currentData.label);

      // Use the provided color or the next default plotly color if none is provided
      let color = currentData.color;
      reducedData.marker.colors.push(color ?? '');
      // typescript definitions may be wrong.  We're not allowed to pass
      // an Array<string | undefined> to marker.colors
      // but the empty string works.
      // Using marker.color instead works type-wise, but it doesn't actually work
      // color-wise!

      return reducedData;
    };

    const primaryDataTrace: Partial<PlotData> = {
      type: 'pie',
      ...data.slices.reduce(reducer, {
        values: [],
        labels: [],
        marker: { colors: [] },
        cumulativeSum: 0,
      }),
      hole: donutOptions?.size,
      direction: 'clockwise',
      sort: false,
      text: textOptions?.sliceTextOverrides,
      textinfo: textOptions?.sliceTextOverrides?.length
        ? 'text'
        : textOptions?.displayOption,
      textposition: textOptions?.displayPosition,
      texttemplate: textOptions?.displayTemplate,
      hoverinfo: restProps.interactive
        ? textOptions?.sliceTextOverrides?.length
          ? 'text'
          : 'label+value+percent'
        : 'none',
    };

    newData.push(primaryDataTrace);

    return {
      // Type definitions from Plot.ly library are out of date. See redefinition of PlotData above.
      // In order to avoid Typescript barfing, we have to perform this
      // casting.
      data: newData as PlotlyPlotData[],
      layout,
      ...restProps,
    };
  }
);

export default PiePlot;
