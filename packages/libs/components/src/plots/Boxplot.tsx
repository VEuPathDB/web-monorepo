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

  const orientation = props.defaultOrientation ?
		      (props.defaultOrientation === 'horizontal' ? 'h' : 'v') : 'v';

  const data = props.data.map((d) => {

    const orientationDependentProps = orientation === 'v' ? 
     { x0: d.label,
       y: d.outliers.length ? [d.outliers] : undefined
     } :
     { y0: d.label,
       x: d.outliers.length ? [d.outliers] : undefined
     };
    
    return { upperfence: [d.upperWhisker],
	     lowerfence: [d.lowerWhisker],
	     median: [d.median],
	     mean: d.mean !== undefined ? [d.mean] : undefined,
	     q1: [d.q1],
	     q3: [d.q3],
	     name: d.label,
	     boxpoints: 'outliers',
	     jitter: 0.1,
	     ...orientationDependentProps,
	     type: 'box' } as const
  });

  const dependentAxis = orientation === 'v' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'v' ? 'xaxis' : 'yaxis';
  
  const layout = {
    [dependentAxis] : {
      rangemode: "tozero" as const,
      title: props.yAxisLabel,
      range: props.defaultYAxisRange
    },
    [independentAxis] : {
      title: props.xAxisLabel
    },
    showlegend: false
  };
  return <PlotlyPlot data={data} layout={layout} />
}
