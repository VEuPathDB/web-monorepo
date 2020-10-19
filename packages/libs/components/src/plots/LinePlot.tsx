import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

export interface Props {
  data: {
    name: PlotData['name'];
    x: PlotData['x'];
    y: PlotData['y'];
    fill: PlotData['fill'];
    line: PlotData['line'];
  }[];
  xLabel: string;
  yLabel: string;
}

export default function LinePlot(props: Props) {
  const { xLabel, yLabel, data, ...plotlyProps } = props;
  const finalData = data.map(d => ({
    ...d,
    type: 'scatter',
    mode: 'lines'
  } as const))
  const layout = {
    xaxis: {
      title: xLabel
    },
    yaxis: {
      title: yLabel
    }
  }
  return (
  <PlotlyPlot {...plotlyProps} layout={layout} data={finalData}/>
  )
}
