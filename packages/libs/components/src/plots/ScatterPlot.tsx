import React, { useState, useCallback } from "react";
import Plot, { Figure } from "react-plotly.js";

/**
 * Data passed to this component, typically gathered by an adapter.
 */
export interface Props {
  xData: number[],
  yData: number[],
  xLabel: string,
  yLabel: string,
  height: number;
  width: number;
  onUpdate?: (state: any) => void;
}

/**
 * Renders a scatter plot.
 * 
 * This is some really excellent documentation about how to use ScatterPlot.
 * 
 * @param props 
 */
export default function ScatterPlot(props: Props) {
  const { xData, yData, onUpdate } = props;
  
  const [ state, updateState ] = useState<Figure>({
    data: [{
      type: 'scatter',
      x: xData,
      y: yData
    }],
    layout: {},
    frames: []
  });

  const handleUpdate = useCallback((figure: Figure, graphDiv: HTMLElement) => {
    updateState(figure);
    if (onUpdate) onUpdate(figure);
  }, [ updateState, onUpdate ]);

  return (
    <Plot
      data={state.data}
      layout={state.layout}
      frames={state.frames || undefined}
      onUpdate={handleUpdate}
    />
  )
}
