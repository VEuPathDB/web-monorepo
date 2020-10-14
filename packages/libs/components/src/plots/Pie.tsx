import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import DefaultColorGen from "./DefaultColorGen";

type Value = number | Date;

type PiePlotDatum = {
  value: Value;
  label: string;
  color?: string;
};

interface PieProps {
  data: PiePlotDatum[];
  interior?: {
    heightPercentage: number;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string|number;
  };
}

export default function Pie(props: PieProps) {
  const { data, interior = null } = props;
  const defaultColorIter = DefaultColorGen();
  let interiorProps;
  let layout = {};
  let newData = [];

  if (interior) {
    interiorProps = {
      hole: interior.heightPercentage,
    };

    if (interior.text) {
      layout = {
        annotations: [{
          font: {
            size: interior.fontSize || 12,
            color: interior.textColor || 'black',
          },
          showarrow: false,
          text: interior.text,
          x: 0.5,
          y: 0.5,
        }]
      }
    }

    // The width of the donut. This is measured along invisible axes that seem
    // to exist in plotly even for a pie chart. It seems like the left side of
    // the pie chart starts at 0 on the x axis and the right side of the chart
    // ends at 1. The middle of the pie is at 0.5 x,y.
    const donutWidth = 0.5 * (1 - interior.heightPercentage);

    // To implement the donut hole background color, we add a feaux data trace
    // inside the hole with no markings
    newData.push({
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
    });
  }

  // Preprocess data for PlotlyPlot
  const reducer = (accumulatorObj: {values: Value[], labels: string[], marker: {colors: string[]}}, currObj: PiePlotDatum) => {
    accumulatorObj.values.push(currObj.value);
    accumulatorObj.labels.push(currObj.label);

    // Use the provided color or the next default plotly color if none is provided
    let color = currObj.color || defaultColorIter.next().value as string;
    accumulatorObj.marker.colors.push(color);

    return accumulatorObj;
  };

  newData.push({
    ...interiorProps,
    ...data.reduce(reducer, {values: [], labels: [], marker: {colors: []}}),
    direction: 'clockwise',
    sort: false,
    hoverinfo: 'label+value+percent',
  });

  return <PlotlyPlot<'values'> data={newData} layout={layout} type="pie"/>
}
