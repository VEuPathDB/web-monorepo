import React from "react";
import PlotlyPlot, { PlotProps, ModebarDefault } from "./PlotlyPlot";
//DKDK block this
// import { PlotComponentProps } from "./Types";
//DKDK import Layout for typing layout, especially with sliders
import { Layout, PlotData } from "plotly.js"

//DKDK following the approach used in PlotlyPlot.tsx to avoid type errors regarding data
type PlotDataKey = keyof PlotData;

//DKDK change interface a bit more: this could avoid error on data type
interface Props<T extends keyof PlotData> extends PlotProps {
  data: Pick<PlotData, T>[];
  xLabel: string;
  yLabel: string;
  plotTitle: string;
  //DKDK involving CI, x & y range may need to be set
  xRange?: number[] | Date[];
  yRange?: number[] | Date[];
  showLegend?: boolean;
}

export default function ScatterAndLinePlotGeneral<T extends PlotDataKey>(props: Props<T>) {
  const { xLabel, yLabel, plotTitle, xRange, yRange, data } = props;
  const layout: Partial<Layout> = {
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
      active: 4,         //DKDK this sets the default location of slider: from 0 (left)
      currentvalue: {
        visible: true,
        xanchor: 'left',
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
          method: 'restyle',
          args: ['opacity', '0']
        },
        {
          label: '0.25',
          method: 'restyle',
          args: ['opacity', '0.25']
        },
        {
          label: '0.5',
          method: 'restyle',
          args: ['opacity', '0.5']
        },
        {
          label: '0.75',
          method: 'restyle',
          args: ['opacity', '0.75']
        },
        {
          label: '1',
          method: 'restyle',
          args: ['opacity', '1']
        }]
    }]
  };

  //DKDK add this per standard
  const finalData = data.map(d => ({ ...d, type: 'scatter' as const }));

  return (
    <PlotlyPlot
      data={finalData}
      layout={{...layout, ...{
        width: props.width,
        height: props.height,
        margin: props.margin,
        showlegend: props.showLegend
      }}}
      config={{
        displayModeBar: props.showModebar !== undefined ? props.showModebar : ModebarDefault,
        staticPlot: props.staticPlot,
      }}
    />
  );
}
