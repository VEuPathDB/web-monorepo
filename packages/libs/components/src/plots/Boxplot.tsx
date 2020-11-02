import React from "react";
import PlotlyPlot from "./PlotlyPlot";

export interface Props {
  data: {
    lowerFence : number,
    q1 : number,
    median : number,
    mean? : number,
    q3 : number,
    upperFence : number,
    label : string,
    rawData? : number[],
    outliers : number[]
  }[];
}

export default function Boxplot(props : Props) {

  const data = props.data.map((d) => ( { upperfence: [d.upperFence],
					 lowerfence: [d.lowerFence],
					 median: [d.median],
					 mean: d.mean !== undefined ? [d.mean] : undefined,
					 q1: [d.q1],
					 q3: [d.q3],
					 name: d.label,
					 x0: d.label,
					 y: d.outliers.length ? [d.outliers] : undefined,
					 boxpoints: 'outliers',
					 jitter: 0.1,
					 type: 'box' } as const ));

  return <PlotlyPlot data={data} layout={{}} />
}
