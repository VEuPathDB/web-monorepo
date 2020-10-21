import React, { lazy, Suspense, useMemo } from "react";
// import { PlotParams, Plot } from "./Types";

import { PlotData as PlotlyPlotData } from 'plotly.js';
import { PlotParams as ReactPlotlyPlotParams } from 'react-plotly.js';
import { PlotData, Data } from 'plotly.js';
import { Plot, PlotParams } from 'react-plotly.js';

// Try to extend these types from here
declare module 'plotly.js' {
  export interface PlotData extends Omit<PlotlyPlotData, 'hoverinfo'> {
    hoverinfo: PlotlyPlotData['hoverinfo'] | PlotlyPlotData['textinfo'],
    sort: boolean;
  }

  export type Data = Partial<PlotData>;
}

declare module 'react-plotly.js' {
  export interface PlotParams extends Omit<ReactPlotlyPlotParams, 'data'> {
    data: Data[];
  }

  export class Plot extends React.PureComponent<PlotParams> {}
}

const config = {
  responsive: true
};

//const Plot = lazy(() => import('react-plotly.js'));

/**
 * Wrapper over the `react-plotly.js` `Plot` component
 * 
 * @param props 
 */
export default function PlotlyPlot(props: PlotParams) {
  const finalStyle = useMemo(() => ({ height: '100%', width: '100%', ...props.style }), [props.style]);
  const finalConfig = useMemo(() => ({ ...config, ...props.config}), [props.config]);

  return (
    <Suspense fallback="Loading...">
      <Plot
        {...props}
        style={finalStyle}
        config={finalConfig}
      />
    </Suspense>
  )
}
