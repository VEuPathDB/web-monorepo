import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotComponentProps } from "./Types";

export interface Props extends PlotComponentProps<'name'|'x'|'y'> {
  xLabel: string;
  yLabel: string;
}

export default function LinePlot(props: Props) {
  const { xLabel, yLabel, ...plotlyProps } = props;
  const layout = {
    xaxis: {
      title: xLabel
    },
    yaxis: {
      title: yLabel
    }
  }
  return (
  <
    PlotlyPlot {...plotlyProps} layout={layout} type="scatter"
    />
  )
}
