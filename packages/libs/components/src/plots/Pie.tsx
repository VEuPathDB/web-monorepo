import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { defaults } from "plotly.js/src/components/color/attributes";

type Value = number | Date;

type PiePlotDatum = {
  value: Value;
  label: string;
  color?: string;
};

type PiePlotData = PiePlotDatum[];

interface PieProps {
  data: PiePlotData;
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

  // A generator function for the default plotly.js colors
  function* defaultColors() {
    let myDefaults: string[] = Array.from(defaults);

    while (true) {
      let nextColor = myDefaults.shift() as string;
      myDefaults.push(nextColor);
      yield nextColor;
    }
  }

  let colorGen = defaultColors();

  // Preprocess data for PlotlyPlot
  const reducer = (accumulatorObj: {values: Value[], labels: string[], marker: {colors: string[]}}, currObj: PiePlotDatum) => {
    accumulatorObj.values.push(currObj.value);
    accumulatorObj.labels.push(currObj.label);

    // Use the provided color or the next default plotly color if none is provided
    let color = currObj.color || colorGen.next().value as string;
    accumulatorObj.marker.colors.push(color);

    return accumulatorObj;
  };

  let interiorProps;
  let layout = {};

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

    // Tried implementing backgroundColor using the shapes interface,
    // but it didn't work very well. Committing for posterity's sake.
    // if (interior.backgroundColor) {
    //   let dountWidth = 0.5 * (1 - interior.heightPercentage);

    //   layout.shapes = [
    //     {
    //       opacity: 1,
    //       xref: 'x',
    //       yref: 'y',
    //       fillcolor: interior.backgroundColor,
    //       x0: dountWidth,
    //       y0: 1 - dountWidth,
    //       x1: dountWidth,
    //       y1: 1 - dountWidth,
    //       type: 'circle',
    //     }
    //   ];
    // }
  }

  let newData = [{
    ...interiorProps,
    ...data.reduce(reducer, {values: [], labels: [], marker: {colors: []}}),
    direction: 'clockwise',
    sort: false,
  }];

  if (interior && interior.backgroundColor) {
    // The width of the donut. This is measured along invisible axes that seem
    // to exist in plotly even for a pie chart. It seems like the left side of
    // the pie chart starts at 0 on the x axis and the right side of the chart
    // ends at 1. The middle of the pie is at 0.5 x,y.
    const dountWidth = 0.5 * (1 - interior.heightPercentage);

    // To implement the donut hole background color, we add a feaux data trace
    // inside the hole with no markings
    newData.push({
      values: [1],
      labels: [''],
      marker: {
        colors: [interior.backgroundColor],
      },
      // Where this data trace should be "plotted" on the "axes".
      // This places it in the center of the donut.
      domain: {
        x: [dountWidth, 1 - dountWidth],
        y: [dountWidth, 1 - dountWidth],
      },
      hoverinfo: 'none',
      textinfo: 'none',
      showlegend: false,
    })
  }

  return <PlotlyPlot<'values'> data={newData} layout={layout} type="pie"/>
}
