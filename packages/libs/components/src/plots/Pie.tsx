import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

export interface Props {
  data: {
    labels: PlotData['labels'];
    values: PlotData['values'];
  }[];
}
export default function Pie(props: Props) {
  const data = props.data.map(d => ({...d, type: 'pie' as const }));
  return <PlotlyPlot data={data} layout={{}} />
}
