import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
//DKDK block this
// import { PlotComponentProps } from "./Types";
//DKDK import Layout for typing layout, especially with sliders
import { Layout, PlotData } from 'plotly.js';

//DKDK following the approach used in PlotlyPlot.tsx to avoid type errors regarding data
type PlotDataKey = keyof PlotData;

//DKDK change interface a bit more: this could avoid error on data type
export interface ScatterplotProps<T extends keyof PlotData> extends PlotProps {
  data: Pick<PlotData, T>[];
  xLabel?: string;
  yLabel?: string;
  plotTitle?: string;
  //DKDK involving CI, x & y range may need to be set
  xRange?: number[] | Date[];
  yRange?: number[] | Date[];
  //DKDK add enable/disable legend and built-in controls
  displayLegend?: boolean;
  displayLibraryControls?: boolean;
  setMargin?: { l: number; r: number; b: number; t: number };
}

export default function ScatterAndLinePlotGeneral<T extends PlotDataKey>(
  props: ScatterplotProps<T>
) {
  const { xLabel, yLabel, plotTitle, xRange, yRange, data } = props;
  const layout: Partial<Layout> = {
    xaxis: {
      title: xLabel ? xLabel : '',
      range: xRange, //DKDK set this for better display: esp. for CI plot
      zeroline: false, //DKDK disable yaxis line
      //DKDK make plot border
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
    },
    yaxis: {
      title: yLabel ? yLabel : '',
      range: yRange, //DKDK set this for better display: esp. for CI plot
      zeroline: false, //DKDK disable xaxis line
      //DKDK make plot border
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
    },
    title: {
      text: plotTitle ? plotTitle : '',
    },
  };

  //DKDK add this per standard
  const finalData = data.map((d) => ({ ...d, type: 'scatter' as const }));

  return (
    <PlotlyPlot
      data={finalData}
      layout={{
        ...layout,
        ...{
          width: props.width,
          height: props.height,
          margin: props.setMargin ? props.setMargin : undefined,
          showlegend: props.displayLegend,
        },
      }}
      config={{
        displayModeBar: props.displayLibraryControls ? 'hover' : false,
        staticPlot: props.staticPlot,
      }}
    />
  );
}
