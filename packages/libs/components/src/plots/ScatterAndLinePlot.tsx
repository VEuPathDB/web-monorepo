import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
import { PlotData } from 'plotly.js';

interface Props extends PlotProps {
  data: Pick<PlotData, 'name' | 'x' | 'y' | 'mode' | 'fill'>[];
  xLabel: string;
  yLabel: string;
  plotTitle: string;
  showLegend?: boolean;
}

export default function ScatterAndLinePlot(props: Props) {
  const { xLabel, yLabel, plotTitle, data } = props;
  const layout = {
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
  const finalData = data.map((d) => ({ ...d, type: 'scatter' as const }));

  return (
    <PlotlyPlot
      data={finalData}
      layout={Object.assign(layout, {
        width: props.width,
        height: props.height,
        margin: props.margin,
        showlegend: props.showLegend,
      })}
      config={{
        displayModeBar:
          props.showModebar !== undefined ? props.showModebar : ModebarDefault,
        staticPlot: props.staticPlot,
      }}
    />
  );
}
