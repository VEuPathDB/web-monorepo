import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotComponentProps } from "./Types";

interface Props extends PlotComponentProps<'name', 'x'|'y'> {
  /** Label for x-axis */
  xLabel: string;
  /** Label for y-axis */
  yLabel: string;  
}

export default function ScatterPlot(props: Props) {
  const { xLabel, yLabel, ...plotlyProps } = props;
  const layout = {
    xaxis: {
      title: xLabel
    },
    yaxis: {
      title: yLabel
    }
  };

  return <PlotlyPlot {...plotlyProps} layout={layout} type="scatter" mode="markers"/>
}
