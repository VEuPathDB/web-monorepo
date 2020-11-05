import React from "react";
import PlotlyPlot from "./PlotlyPlot";

export interface Props {
  data: {
    lowerWhisker? : number,
    q1 : number,
    median : number,
    mean? : number,
    q3 : number,
    upperWhisker? : number,
    label : string,
    rawData? : number[],
    outliers : number[]
  }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  defaultYAxisRange? : [number, number];
  defaultOrientation?: 'vertical' | 'horizontal';
}

export default function Boxplot(props : Props) {

  const data = props.data.map((d) => ( { upperfence: [d.upperWhisker],
					 lowerfence: [d.lowerWhisker],
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


  const layout = {
    yaxis : {
      rangemode: "tozero" as const,
      title: props.yAxisLabel,
      range: props.defaultYAxisRange
    },
    xaxis : {
      title: props.xAxisLabel
    },
    showlegend: false
  };
  return <PlotlyPlot data={data} layout={layout} />
}
