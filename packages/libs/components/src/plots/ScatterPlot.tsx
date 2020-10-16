import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

interface Props {
  data: {
    name: PlotData['name'];
    x: PlotData['x'];
    y: PlotData['y'];
  }[];
  /** Label for x-axis */
  xLabel: string;
  /** Label for y-axis */
  yLabel: string;  
}

export default function ScatterPlot(props: Props) {
  const layout = {
    xaxis: {
      title: props.xLabel
    },
    yaxis: {
      title: props.yLabel
    }
  };

  const data = props.data.map(d => ({ ...d, type: 'scatter', mode: 'markers' } as const));

  return (
    <PlotlyPlot data={data} layout={layout}/>
  );
}
