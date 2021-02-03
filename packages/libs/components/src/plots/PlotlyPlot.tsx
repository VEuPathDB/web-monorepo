import React, { lazy, Suspense, useMemo } from "react";
import { PlotParams } from 'react-plotly.js';

type Margin = {
  l: number,
  r: number,
  t: number,
  b: number,
}

//DKDK set props for legend position
type legendProp = {
  x?: number,
  y?: number,
  //DKDK xanchor is for positioning legend inside plot
  xanchor?: 'auto' | 'center' | 'left' | 'right',
  orientation?: string,
}

export interface PlotProps {
  width?: number,
  height?: number,
  margin?: Partial<Margin>,
  //DKDK add legend prop for positioning
  legend?: legendProp,
}

const config = {
  responsive: true
};

const Plot = lazy(() => import('react-plotly.js'));

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
