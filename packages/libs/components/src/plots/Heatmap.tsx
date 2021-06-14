import React from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { PlotData, Layout, Annotations } from 'plotly.js';
import Spinner from '../components/Spinner';

export interface Props extends PlotProps {
  data: Array<{
    x: number[] | string[];
    y: number[] | string[];
    z: number[][];
  }>;
  xLabel?: string;
  yLabel?: string;
  plotTitle?: string;
  showValue?: boolean;
  //DKDK add zsmooth here so that it can be treated as a Props out of data
  zsmooth?: 'fast' | 'best' | false;
}

export default function Heatmap(props: Props) {
  //DKDK add zsmooth here so that it can be treated as a Props out of data
  const {
    xLabel,
    yLabel,
    plotTitle,
    width,
    height,
    showValue,
    zsmooth,
    data,
    margin,
  } = props;
  const layout: Partial<Layout> = {
    width: width,
    height: height,
    //DKDK set annotations for displaying values at each cell
    annotations: [],
    xaxis: {
      title: xLabel,
    },
    yaxis: {
      title: yLabel,
    },
    title: {
      text: plotTitle,
    },
  };

  //DKDK set variables for annotation
  let xValues = data[0].x;
  let yValues = data[0].y;
  let zValues = data[0].z;
  //DKDK set (default) textColor
  let textColor = 'white';

  //DKDK add value texts at each cell when props.showValue = true
  if (showValue) {
    for (let i = 0; i < yValues.length; i++) {
      for (let j = 0; j < xValues.length; j++) {
        // let currentValue = zValues[i][j];
        // if (currentValue != 0) {
        //   textColor = 'white';
        // } else {
        //   textColor = 'black';
        // }
        let result: Partial<Annotations> = {
          xref: 'x',
          yref: 'y',
          x: xValues[j],
          y: yValues[i],
          //DKDK zValues(i.e., z) is number[][] so converting it into string to avoid type error
          text: zValues[i][j].toString(),
          font: {
            family: 'Arial',
            size: 12,
            // color: 'rgb(50, 171, 96)'
            color: textColor,
          },
          showarrow: false,
        };
        //DKDK set condition to avoid type error
        layout.annotations ? layout.annotations.push(result) : [];
      }
    }
  }

  //DKDK add zsmooth here so that it can be treated as a Props out of data
  const finalData = data.map((d) => ({
    ...d,
    type: 'heatmap' as const,
    zsmooth: zsmooth,
  }));

  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      <PlotlyPlot
        data={finalData}
        layout={Object.assign(layout, {
          width: width,
          height: height,
          margin: margin,
        })}
      />
      {props.showSpinner && <Spinner />}
    </div>
  );
}
