import React, { useState, useCallback, lazy, Suspense } from "react";
import { Figure } from "react-plotly.js";
import { PlotType, PlotData, Layout, Frame } from "plotly.js";
import { PlotComponentProps } from "./Types";

interface Props extends PlotComponentProps<any> {
  /**
   * The type of Plotly plot
   */
  type: PlotType;
  /**
   * The mode of Plotly plot
   */
  mode?: PlotData['mode'];
  /**
   * Plotly layout options
   */
  layout?: Partial<Layout>;
  /**
   * Plotly frames
   */
  frames?: Frame[];
}

const Plot = lazy(() => import('react-plotly.js'));

/**
 * Wrapper over the `react-plotly.js` `Plot` component
 * 
 * @param props 
 */
export default function PlotlyPlot(props: Props) {
  const { data, layout = {}, frames = null, onPlotUpdate, mode, type } = props;

  const [ state, updateState ] = useState<Figure>({
    data: data.map(trace => ({
      type: type,
      mode: mode,
      ...trace
    })),
    layout,
    frames
  });

  const handleUpdate = useCallback((figure: Figure) => {
    updateState(figure);
    if (onPlotUpdate) onPlotUpdate(figure);
  }, [ updateState, onPlotUpdate ]);

  return (
    <Suspense fallback="Loading...">
      <Plot
        data={state.data}
        layout={state.layout}
        frames={state.frames || undefined}
        onInitialized={handleUpdate}
        onUpdate={handleUpdate}
      />
    </Suspense>
  )
}
