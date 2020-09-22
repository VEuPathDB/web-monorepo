import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotComponentProps } from "./Types";
//DKDK import Layout for typing layout, especially with sliders
import { Layout, PlotData } from "plotly.js"

//DKDK following the approach used in PlotlyPlot.tsx to avoid type errors regarding data
type PlotDataKey = keyof PlotData;
interface Props<T extends PlotDataKey> extends PlotComponentProps<T> {
  // interface Props extends PlotComponentProps<'x'|'y'|'name'> {
  xLabel: string;
  yLabel: string;
  plotTitle: string;
  //DKDK involving CI, x & y range may need to be set
  xRange?: number[] | Date[]
  yRange?: number[] | Date[]
}

export default function ScatterAndLinePlotCIReal<T extends PlotDataKey>(props: Props<T>) {
  const { xLabel, yLabel, plotTitle, xRange, yRange, ...plotlyProps } = props;
  const layout: Partial<Layout> = {
    width: 1000,
    height: 600,
    xaxis: {
      title: xLabel,
      range: xRange,      //DKDK set this for better display: esp. for CI plot
      zeroline: false,    //DKDK disable yaxis line
      //DKDK make plot border
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
    },
    yaxis: {
      title: yLabel,
      range: yRange,      //DKDK set this for better display: esp. for CI plot
      zeroline: false,    //DKDK disable xaxis line
      //DKDK make plot border
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
    },
    title: {
      text: plotTitle
    },
    sliders: [{          //DKDK this slider part is manually added here!
      pad: {t: 50},
      currentvalue: {
        visible: true,
        xanchor: 'left',
        offset: 10,
        prefix: 'Opacity ',
        suffix: '',
        font: {
          color: '#888',
          size: 20
        }
      },
      steps: [{
        label: '1',
        method: 'restyle',
        args: ['opacity', '1']
      }, {
        label: '0.75',
        method: 'restyle',
        args: ['opacity', '0.75']
      }, {
        label: '0.5',
        method: 'restyle',
        args: ['opacity', '0.5']
      }, {
        label: '0.25',
        method: 'restyle',
        args: ['opacity', '0.25']
      }, {
        label: '0',
        method: 'restyle',
        args: ['opacity', '0']
      }]
    }]
  };

  return (
    <PlotlyPlot
      {...plotlyProps}
      layout={layout}
      type="scatter"
    />
  );
}
