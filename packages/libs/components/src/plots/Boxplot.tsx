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
}

export default function Boxplot(props : Props) {

  const orientation = props.defaultOrientation ?
		      (props.defaultOrientation === 'horizontal' ? 'h' : 'v') : 'v';

  const data = props.data.map((d) => {

    const orientationDependentProps = orientation === 'v' ? 
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
	     boxmean: d.mean !== undefined && props.defaultShowMean ,
	     q1: [d.q1],
	     q3: [d.q3],
	     name: d.label,
	     boxpoints: d.rawData ? 'all' : 'outliers',
	     jitter: 0.1, // should be dependent on the number of datapoints...?
	     marker: { opacity: 0.5 },
	     ...orientationDependentProps,
	     type: 'box' } as const
  });

  const dependentAxis = orientation === 'v' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'v' ? 'xaxis' : 'yaxis';

  const pointTraceIndices = props.data.map((d, index) => d.rawData || d.outliers.length ? index : -1).filter((i) => i>=0);
  
  const opacitySliders = pointTraceIndices.length ? [
    {          // mostly copy-pasted from DKDK
      pad: {t: 50},
      active: 2,         //DKDK this sets the default location of slider: from 0 (left)
      currentvalue: {
        visible: true,
        xanchor: 'left' as const,
        offset: 10,
        prefix: 'Opacity = ',
        suffix: '',
        font: {
          color: '#888',
          size: 20
        }
      },
      steps: [
        {
          label: '0',
          method: 'restyle' as const,
          args: ['marker.opacity', '0', pointTraceIndices]
        },
        {
          label: '0.25',
          method: 'restyle' as const,
          args: ['marker.opacity', '0.25', pointTraceIndices]
        },
        {
          label: '0.5',
          method: 'restyle' as const,
          args: ['marker.opacity', '0.5', pointTraceIndices]
        },
        {
          label: '0.75',
          method: 'restyle' as const,
          args: ['marker.opacity', '0.75', pointTraceIndices]
        },
        {
          label: '1',
          method: 'restyle' as const,
          args: ['marker.opacity', '1', pointTraceIndices]
        }]
    }
  ] : [];
  
  const layout = {
    [dependentAxis] : {
      rangemode: "tozero" as const,
      title: props.yAxisLabel,
      range: props.defaultYAxisRange
    },
    [independentAxis] : {
      title: props.xAxisLabel
    },
    showlegend: false,
    sliders: [...opacitySliders]
  };
  return <PlotlyPlot data={data} layout={layout} />
}
