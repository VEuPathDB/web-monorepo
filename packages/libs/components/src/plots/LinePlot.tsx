import React from "react";
import PlotlyPlot, { PlotProps, ModebarDefault } from "./PlotlyPlot";
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
}

export default function LinePlot(props: Props) {
  const { xLabel, yLabel, data, width, height, margin, showLegend, showModebar, ...plotlyProps } = props;
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
      margin: margin,
      showlegend: showLegend,
    })}
    config={{
      displayModeBar: props.showModebar !== undefined ? props.showModebar : ModebarDefault,
      staticPlot: props.staticPlot,
    }}
    data={finalData}
  />
  )
}
