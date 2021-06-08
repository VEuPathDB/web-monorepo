import React, { lazy, Suspense, useMemo } from 'react';
import { PlotParams } from 'react-plotly.js';

type Margin = {
  l: number;
  r: number;
  t: number;
  b: number;
};

// set props for legend position
type legendProp = {
  x?: number;
  y?: number;
  // xanchor is for positioning legend inside plot
  xanchor?: 'auto' | 'center' | 'left' | 'right';
  orientation?: 'h' | 'v' | undefined;
};

export interface PlotProps {
  width?: number;
  height?: number;
  margin?: Partial<Margin>;
  staticPlot?: boolean;
  showModebar?: boolean | 'hover';
  // add legend prop for positioning
  legend?: legendProp;
}

// Passing undefined doesn't revert to default modebar behavior,
// so use this as the default
export const ModebarDefault = 'hover';

const config = {
  responsive: true,
};

const Plot = lazy(() => import('react-plotly.js'));

/**
 * Wrapper over the `react-plotly.js` `Plot` component
 *
 * @param props
 */
export default function PlotlyPlot(props: PlotParams) {
  const finalStyle = useMemo(
    () => ({ height: '100%', width: '100%', ...props.style }),
    [props.style]
  );
  const finalConfig = useMemo(() => ({ ...config, ...props.config }), [
    props.config,
  ]);
  // change layout: add axis fixedrange
  const finalLayout = useMemo(
    () => ({
      ...props.layout,
      xaxis: { ...props.layout.xaxis, fixedrange: true },
      yaxis: { ...props.layout.yaxis, fixedrange: true },
    }),
    [props.layout]
  );

  return (
    <Suspense fallback="Loading...">
      {/* set layout props */}
      <Plot
        {...props}
        layout={finalLayout}
        style={finalStyle}
        config={finalConfig}
      />
    </Suspense>
  );
}
