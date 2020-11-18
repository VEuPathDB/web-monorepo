import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

interface Props {
  // N columns/exposure, M rows/outcome
  data: Array<Array<number>>; // MxN (M = outerLength; N = innerLength)
  exposureValues: Array<string>; // N
  outcomeValues: Array<string>; // M
  exposureLabel: string;
  outcomeLabel: string;
  widths: Array<number>; // N
  colors?: Array<string>; // M
}

export default function MosaicPlot(props: Props) {
  const widths_sum = props.widths.reduce((a, b) => a + b, 0);
  const widths_ratios = props.widths.map(a => a / widths_sum);
  const tickvals = widths_ratios.map((val, i) => {
    let column_start = widths_ratios.slice(0, i).reduce((a, b) => a + b, 0);
    return column_start + val/2;
  });

  const layout = {
    xaxis: {
      title: props.exposureLabel,
      range: Array.from(Array(props.widths.length).keys()),
      tickmode: 'array',
      tickvals: tickvals,
    },
    yaxis: {
      title: props.outcomeLabel,
    },
    barmode: 'stack',
  } as const;

  const data = props.data.map((d, i) => ({
    x: props.exposureValues,
    y: d,
    name: props.outcomeValues[i],
    width: widths_ratios.map(a => a * widths_ratios.length),
    type: 'bar',
    marker: {
      line: {
        width: 2,
        color: 'white',
      },
    },
  } as const)).reverse();

  return (
    <PlotlyPlot data={data} layout={layout}/>
  );
}
