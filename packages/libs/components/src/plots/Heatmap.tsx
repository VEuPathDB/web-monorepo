import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData, Layout, Annotations } from 'plotly.js';

interface Props {
  data: Array<{x: number[] | string[], y: number[] | string[], z: number[][], type: string, zsmooth: 'fast' | 'best' | false}>;
  xLabel?: string;
  yLabel?: string;
  plotTitle?: string;
  showValue?: boolean;
  width: number;
  height: number;
}

export default function Heatmap(props: Props) {
  const { xLabel, yLabel, plotTitle, width, height, showValue, data } = props;
  const layout: Partial<Layout> = {
    width: width,
    height: height,
    //DKDK set annotations for displaying values at each cell
    annotations: [],
    xaxis: {
      title: xLabel
    },
    yaxis: {
      title: yLabel
    },
    title: {
      text: plotTitle
    }
  };

  //DKDK set variables for annotation
  let xValues = data[0].x
  let yValues = data[0].y
  let zValues = data[0].z
  //DKDK set (default) textColor
  let textColor = 'white'

  //DKDK add value texts at each cell when props.showValue = true
  if(showValue) {
    for ( let i = 0; i < yValues.length; i++ ) {
      for ( let j = 0; j < xValues.length; j++ ) {
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
            color: textColor
          },
          showarrow: false,
        };
        //DKDK set condition to avoid type error
        (layout.annotations) ? layout.annotations.push(result) : []
      }
    }
  }

  const finalData = data.map(d => ({ ...d, type: 'heatmap' as const }));

  return (
    <PlotlyPlot data={finalData} layout={layout} />
  );
}
