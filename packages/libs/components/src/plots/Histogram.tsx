import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotComponentProps } from "./Types";

export default function Histogram(props: PlotComponentProps<number, number>) {
  return <PlotlyPlot {...props} type="histogram"/>
}
