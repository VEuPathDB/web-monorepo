/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
// import Layout for typing layout, especially with sliders
import { Layout } from 'plotly.js';

export interface ScatterplotProps extends PlotProps {
  /** Data for the scatter plotplot */
  data: Array<{
    /** x/y data */
    x: number[] | Date[];
    y: number[] | Date[];
    /** legend text */
    name?: string;
    /** plot style */
    mode?: 'markers' | 'lines' | 'lines+markers';
    /** plot with marker: scatter plot with raw data */
    marker?: {
      /** marker color */
      color?: string;
      /** marker size: no unit */
      size?: number;
      /** marker's perimeter setting */
      line?: {
        /** marker's perimeter color */
        color?: string;
        /** marker's perimeter color: no unit */
        width?: number;
      };
    };
    /** plot with marker: scatter plot with smoothedMean and bestfitline; line and density plots */
    line?: {
      /** line color */
      color?: string;
      /** line style */
      shape?: 'spline' | 'linear';
      /** line width: no unit */
      width?: number;
    };
    /** filling plots: tozerox - scatter plot's confidence interval; toself - density plot */
    fill?: 'tozerox' | 'toself';
    /** filling plots: color */
    fillcolor?: string;
  }>;
  /** x-axis label */
  xLabel?: string;
  /** y-axis label */
  yLabel?: string;
  /** plot title */
  title?: string;
  /** x-axis range: required for confidence interval */
  xRange?: number[] | Date[];
  /** y-axis range: required for confidence interval */
  yRange?: number[] | Date[];
  /** show plot legend */
  displayLegend?: boolean;
  /** show plotly's built-in controls */
  displayLibraryControls?: boolean;
}

export default function ScatterAndLinePlotGeneral(props: ScatterplotProps) {
  const { xLabel, yLabel, title, xRange, yRange, data } = props;

  const layout: Partial<Layout> = {
    xaxis: {
      title: xLabel ? xLabel : '',
      range: xRange, // set this for better display: esp. for CI plot
      zeroline: false, // disable yaxis line
      // make plot border
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
    },
    yaxis: {
      title: yLabel ? yLabel : '',
      range: yRange, // set this for better display: esp. for CI plot
      zeroline: false, // disable xaxis line
      // make plot border
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
    },
    // plot title
    title: {
      text: title ? title : undefined,
    },
  };

  // add this per standard
  // const finalData = data.map((d) => ({ ...d, type: 'scatter' as const }));
  const finalData = data.map((d) => ({ ...d }));

  return (
    <PlotlyPlot
      data={finalData}
      layout={{
        ...layout,
        ...{
          width: props.width,
          height: props.height,
          margin: props.margin ? props.margin : undefined,
          showlegend: props.displayLegend,
        },
      }}
      config={{
        displayModeBar: props.displayLibraryControls ? 'hover' : false,
        staticPlot: props.staticPlot,
      }}
    />
  );
}
