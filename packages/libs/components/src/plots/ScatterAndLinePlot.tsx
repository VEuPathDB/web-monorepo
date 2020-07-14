import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotComponentProps } from "./Types";

interface Props extends PlotComponentProps<'name'|'x'|'y'|'mode'|'fill'> {
  xLabel: string;
  yLabel: string;  
  plotTitle: string;
}

export default function ScatterAndLinePlot(props: Props) {
  const { xLabel, yLabel, plotTitle, ...plotlyProps } = props;
  const layout = {
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

  return (
    <PlotlyPlot
      {...plotlyProps}
      layout={layout}
      type="scatter"
    />
  );
}
