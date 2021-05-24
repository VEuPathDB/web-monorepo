import PlotlyPlot, { PlotProps } from './PlotlyPlot';
// import Layout for typing layout, especially with sliders
import { Layout } from 'plotly.js';

// change interface a bit more: this could avoid error on data type
// export interface ScatterplotProps<T extends keyof PlotData> extends PlotProps {
export interface ScatterplotProps extends PlotProps {
  // data: any,
  data: Array<{
    x: number[] | Date[];
    y: number[] | Date[];
    name?: string;
    mode?: string;
    // type?: string,
    marker?: {
      color?: string;
      size?: number;
    };
    line?: {
      color?: string;
      shape?: string;
      width?: number;
    };
    fill?: string;
    fillcolor?: string;
  }>;
  xLabel?: string;
  yLabel?: string;
  // plotTitle?: string;
  title?: string;
  // involving CI, x & y range may need to be set
  xRange?: number[] | Date[];
  yRange?: number[] | Date[];
  // add enable/disable legend and built-in controls
  displayLegend?: boolean;
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
