import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
import defaultColorGen from '../utils/defaultColorGen';
import { PlotData as PlotlyPlotData } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';

export interface PlotData extends Omit<PlotlyPlotData, 'hoverinfo'> {
  hoverinfo: PlotlyPlotData['hoverinfo'] | PlotlyPlotData['textinfo'];
  sort: boolean;
  texttemplate: string | string[];
}

type PiePlotDatum = {
  value: number;
  label: string;
  color?: string;
};

export interface Props extends PlotProps {
  data: PiePlotDatum[];
  interior?: {
    heightPercentage: number;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string | number;
  };
  showLegend?: boolean;
  text?: string[];
  textinfo?: PlotData['textinfo'];
  textposition?: 'inside' | 'outside' | 'auto' | 'none';
  texttemplate?: string | string[];
  showHoverInfo?: boolean;
}

export default function PiePlot(props: Props) {
  const { data, interior = null } = props;
  const defaultColorIter = defaultColorGen();
  let interiorProps;
  let newData: Partial<PlotData>[] = [];
  let layout: PlotParams['layout'] = {};

  if (interior) {
    interiorProps = {
      hole: interior.heightPercentage,
    };

    if (interior.text) {
      Object.assign(layout, {
        annotations: [
          {
            font: {
              size: interior.fontSize || 12,
              color: interior.textColor || 'black',
            },
            showarrow: false,
            text: interior.text,
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
    const donutWidth = 0.5 * (1 - interior.heightPercentage);

    // To implement the donut hole background color, we add a feaux data trace
    // inside the hole with no markings
    const feauxDataTrace: Partial<PlotData> = {
      type: 'pie',
      values: [1],
      labels: [''],
      marker: {
        colors: [interior.backgroundColor || 'white'],
      },
      // Where this data trace should be "plotted" on the "axes".
      // This places it in the center of the donut.
      domain: {
        x: [donutWidth, 1 - donutWidth],
        y: [donutWidth, 1 - donutWidth],
      },
      hoverinfo: 'none',
      textinfo: 'none',
      showlegend: false,
    };
    newData.push(feauxDataTrace);
  }

  // Preprocess data for PlotlyPlot
  const reducer = (
    accumulatorObj: {
      values: number[];
      labels: string[];
      marker: { colors: string[] };
    },
    currObj: PiePlotDatum
  ) => {
    accumulatorObj.values.push(currObj.value);
    accumulatorObj.labels.push(currObj.label);

    // Use the provided color or the next default plotly color if none is provided
    let color = currObj.color || (defaultColorIter.next().value as string);
    accumulatorObj.marker.colors.push(color);

    return accumulatorObj;
  };

  const primaryDataTrace: Partial<PlotData> = {
    ...interiorProps,
    ...data.reduce(reducer, { values: [], labels: [], marker: { colors: [] } }),
    type: 'pie',
    direction: 'clockwise',
    sort: false,
    text: props.text,
    textinfo: props.textinfo,
    hoverinfo: props.showHoverInfo ? 'label+value+percent' : 'none',
    textposition: props.textposition,
    texttemplate: props.texttemplate,
  };

  newData.push(primaryDataTrace);

  if (props.staticPlot) {
    layout.hovermode = false;
  }

  return (
    <PlotlyPlot
      data={newData as any} // Casting as 'any' to avoid issues with PlotData for pie charts
      layout={{
        ...layout,
        ...{
          width: props.width,
          height: props.height,
          margin: props.margin,
          showlegend: props.showLegend,
        },
      }}
      config={{
        displayModeBar:
          props.showModebar !== undefined ? props.showModebar : ModebarDefault,
        staticPlot: props.staticPlot,
      }}
    />
  );
}
