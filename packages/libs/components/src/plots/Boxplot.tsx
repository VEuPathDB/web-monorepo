import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { Datum } from 'plotly.js';

export interface Props {
  data: {
    lowerWhisker? : Datum,
    q1 : Datum,  // would like PlotData['q1'] but is the @types module not up to date?
    median : Datum,
    mean? : Datum,
    q3 : Datum,
    upperWhisker? : Datum,
    label : string,
    color? : string,
    rawData? : Datum[], // PlotData['y'] | PlotData['x'], // doesn't seem to work
                        // but are we trying to remove dependencies on Plotly types?
    outliers : Datum[]
  }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  defaultYAxisRange? : [Datum, Datum];
  defaultOrientation?: 'vertical' | 'horizontal';
  defaultShowRawData?: boolean;
  defaultShowMean?: boolean;
  defaultOpacity?: number;
}

export default function Boxplot(props : Props) {

  const data = props.data.map((d) => {

    const orientationDependentProps = props.defaultOrientation === 'vertical' ? 
     { x0: d.label,
       y: d.rawData && props.defaultShowRawData ? [ d.rawData ] : d.outliers.length ? [d.outliers] : undefined
     } :
     { y0: d.label,
       x: d.rawData && props.defaultShowRawData ? [ d.rawData ] : d.outliers.length ? [d.outliers] : undefined
     };
    
    return { upperfence: [d.upperWhisker],
	     lowerfence: [d.lowerWhisker],
	     median: [d.median],
	     mean: d.mean !== undefined ? [d.mean] : undefined,
	     boxmean: d.mean !== undefined && props.defaultShowMean,
	     q1: [d.q1],
	     q3: [d.q3],
	     name: d.label,
	     boxpoints: d.rawData ? 'all' : 'outliers',
	     jitter: 0.1, // should be dependent on the number of datapoints...?
	     marker: {
	       opacity: props.defaultOpacity,
 	       color: d.color,
	     },
	     ...orientationDependentProps,
	     type: 'box' } as const
  });

  const dependentAxis = props.defaultOrientation === 'vertical' ? 'yaxis' : 'xaxis';
  const independentAxis = props.defaultOrientation === 'vertical' ? 'xaxis' : 'yaxis';

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

Boxplot.defaultProps = {
  defaultOpacity: 0.5,
  defaultOrientation: 'vertical'
}

