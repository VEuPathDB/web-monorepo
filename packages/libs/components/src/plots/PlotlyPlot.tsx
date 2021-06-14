import React, { lazy, Suspense, useMemo, CSSProperties } from 'react';
import { PlotParams } from 'react-plotly.js';
import Spinner from '../components/Spinner';

// set props for legend position // BOB tidy up TODO FIXME
type legendProp = {
  x?: number;
  y?: number;
  // xanchor is for positioning legend inside plot
  xanchor?: 'auto' | 'center' | 'left' | 'right';
  orientation?: 'h' | 'v' | undefined;
};

export interface PlotProps {
  /** add CSS styles for plot component */
  containerStyles?: CSSProperties;
  /** disable mouse-overs and interaction if true */
  staticPlot?: boolean;
  /** show Plotly's mode bar */
  displayLibraryControls?: boolean;
  // add legend prop for positioning TODO FIXME
  legend?: legendProp;
  // show a loading spinner on top of the plot TODO FIXME
  showSpinner?: boolean;
}

const Plot = lazy(() => import('react-plotly.js'));

const defaultStyles = {
  height: '100%',
  width: '100%',
};

/**
 * Wrapper over the `react-plotly.js` `Plot` component
 *
 * @param props : PlotProps & PlotParams
 *
 * Takes all Plotly props (PlotParams) and our own PlotProps for
 * controlling global things like spinner, library controls etc
 *
 */
export default function PlotlyPlot(props: PlotProps & PlotParams) {
  const finalStyle = useMemo(
    () => ({ ...defaultStyles, ...props.containerStyles }),
    [props.containerStyles]
  );

  // config is derived purely from PlotProps props
  const finalConfig = useMemo(
    () =>
      ({
        responsive: true,
        displayModeBar: props.displayLibraryControls ? 'hover' : false,
        staticPlot: props.staticPlot ? props.staticPlot : false,
      } as PlotParams['config']),
    [props.displayLibraryControls, props.staticPlot]
  );

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
      <Plot
        {...props}
        layout={finalLayout}
        style={finalStyle}
        config={finalConfig}
      />
      {props.showSpinner && <Spinner />}
    </Suspense>
  );
}
