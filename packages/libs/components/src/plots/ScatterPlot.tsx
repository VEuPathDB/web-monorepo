import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotComponentProps } from "./Types";

export default function ScatterPlot(props: PlotComponentProps<number, number>) {
  return <PlotlyPlot {...props} type="scatter" mode="markers"/>
}
