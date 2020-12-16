import React from "react";
import PlotlyPlot, { PlotProps } from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

interface Props extends PlotProps {
  data: {
    name: PlotData['name'];
    x: PlotData['x'];
    y: PlotData['y'];
  }[];
  /** Label for x-axis */
  xLabel: string;
  /** Label for y-axis */
  yLabel: string;
  showLegend?: boolean;
  showModebar?: boolean;
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
    <PlotlyPlot
      data={data}
      layout={Object.assign(layout, {
        width: props.width,
        height: props.height,
        showlegend: props.showLegend
      })}
      config={{displayModeBar: props.showModebar}}
    />
  );
}
