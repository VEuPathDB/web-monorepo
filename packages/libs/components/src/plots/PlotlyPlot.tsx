import React, { useState, useCallback, lazy, Suspense } from "react";
import { Figure } from "react-plotly.js";
import { PlotType, PlotData, Datum } from "plotly.js";
import { PlotComponentProps } from "./Types";

interface Props<XType extends Datum, YType extends Datum> extends PlotComponentProps<XType, YType> {
  type: PlotType;
  mode?: PlotData['mode'];
}

const Plot = lazy(() => import('react-plotly.js'));

/**
 * Renders a scatter plot.
 * 
 * This is some really excellent documentation about how to use ScatterPlot.
 * 
 * @param props 
 */
export default function PlotlyPlot<XType extends Datum, YType extends Datum>(props: Props<XType, YType>) {
  const { data, xLabel, yLabel, height, width, onPlotUpdate, mode, type } = props;

  const [ state, updateState ] = useState<Figure>({
    data: data.map(trace => ({
      type: type,
      mode: mode,
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

  const handleUpdate = useCallback((figure: Figure) => {
    updateState(figure);
    if (onPlotUpdate) onPlotUpdate(figure);
  }, [ updateState, onPlotUpdate ]);

  return (
    <Suspense fallback="Loading...">
      <Plot
        style={{ height, width }}
        data={state.data}
        layout={state.layout}
        frames={state.frames || undefined}
        onInitialized={handleUpdate}
        onUpdate={handleUpdate}
      />
    </Suspense>
  )
}
