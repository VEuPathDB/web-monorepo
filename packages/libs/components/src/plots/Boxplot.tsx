import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData, Datum } from 'plotly.js';

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
}

export default function Boxplot(props : Props) {

  const orientation = props.defaultOrientation ?
		      (props.defaultOrientation === 'horizontal' ? 'h' : 'v') : 'v';

  const data = props.data.map((d) => {

    const orientationDependentProps = orientation === 'v' ? 
     { x0: d.label,
       y: d.rawData ? [d.rawData] : d.outliers.length ? [d.outliers] : undefined
     } :
     { y0: d.label,
       x: d.rawData ? [d.rawData] : d.outliers.length ? [d.outliers] : undefined
     };
    
    return { upperfence: [d.upperWhisker],
	     lowerfence: [d.lowerWhisker],
	     median: [d.median],
	     mean: d.mean !== undefined ? [d.mean] : undefined,
	     boxmean: d.mean !== undefined,
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

  const rawDataTraceIndices = props.data.map((d, index) => d.rawData ? index : -1).filter((i) => i>=0);
  const meanTraceIndices = props.data.map((d, index) => d.mean !== undefined ? index : -1).filter((i) => i>=0);

  const pointTraceIndices = props.data.map((d, index) => d.rawData || d.outliers.length ? index : -1).filter((i) => i>=0);
  
  const updatemenus = [
    {
      buttons: rawDataTraceIndices.length ? [
	{
	  args: ['boxpoints', 'all', rawDataTraceIndices],
	  label: 'Show raw data',
	  method: 'restyle'
	},
	{
	  args: ['boxpoints', 'outliers', rawDataTraceIndices],
	  label: 'Hide raw data',
	  method: 'restyle'
	}
      ] : [],
      type: 'buttons',
      x: 0,
      y: 1.25
    },
    {
      buttons: meanTraceIndices.length ? [
	{
	  args: ['boxmean', true, meanTraceIndices],
	  label: 'Show mean',
	  method: 'restyle'
	},
	{
	  args: ['boxmean', false, meanTraceIndices],
	  label: 'Hide mean',
	  method: 'restyle'
	}
      ] : [],
      type: 'buttons',
      x: 0.25,
      y: 1.25
    },
    {
      buttons: [
	{
	  args: [],
	  label: 'Vertical boxes TBC',
	  method: 'skip'
	},
	{
	  args: [],
	  label: 'Horizontal boxes TBC',
	  method: 'skip'
	}
      ],
      type: 'buttons',
      x: 0.5,
      y: 1.25
    }
  ];

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
    updatemenus,
    sliders: [...opacitySliders]
  };
  return <PlotlyPlot data={data} layout={layout} />
}
