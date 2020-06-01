import React, { useState, useCallback } from "react";
import Plot, { Figure } from "react-plotly.js";
import { PlotComponentProps } from "./Types";

/**
 * Renders a scatter plot.
 * 
 * This is some really excellent documentation about how to use ScatterPlot.
 * 
 * @param props 
 */
export default function ScatterPlot(props: PlotComponentProps<number, number>) {
  const { data, xLabel, yLabel, height, width, onPlotUpdate } = props;
  
  const [ state, updateState ] = useState<Figure>({
    data: data.map(trace => ({
      type: 'scatter',
      mode: 'markers',
      x: trace.x,
      y: trace.y,
      name: trace.name
    })),
    layout: {
      xaxis: {
        title: xLabel
      },
      yaxis: {
        title: yLabel
      }
    },
    frames: []
  });

  const handleUpdate = useCallback((figure: Figure, graphDiv: HTMLElement) => {
    updateState(figure);
    if (onPlotUpdate) onPlotUpdate(figure);
  }, [ updateState, onPlotUpdate ]);

  return (
    <Plot
      style={{ height, width }}
      data={state.data}
      layout={state.layout}
      frames={state.frames || undefined}
      onInitialized={handleUpdate}
      onUpdate={handleUpdate}
    />
  )
}
