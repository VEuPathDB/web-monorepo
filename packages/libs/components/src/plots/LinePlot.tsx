import React from "react";
import PlotlyPlot, { PlotProps } from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

export interface Props extends PlotProps {
  data: {
    name: PlotData['name'];
    x: PlotData['x'];
    y: PlotData['y'];
    fill: PlotData['fill'];
    line: PlotData['line'];
  }[];
  xLabel: string;
  yLabel: string;
  showLegend?: boolean;
  showModebar?: boolean;
}

export default function LinePlot(props: Props) {
  const { xLabel, yLabel, data, width, height, showLegend, showModebar, ...plotlyProps } = props;
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
  <PlotlyPlot
    {...plotlyProps}
    layout={Object.assign(layout, {
      width: width,
      height: height,
      showlegend: showLegend
    })}
    config={{displayModeBar: showModebar}}
    data={finalData}
  />
  )
}
