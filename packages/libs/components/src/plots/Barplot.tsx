import { useEffect, useMemo, useState } from 'react';
import { PlotParams } from 'react-plotly.js';

// Definitions
import { DARK_GRAY } from '../constants/colors';

// Components
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { Layout } from 'plotly.js';

// in this example, the main variable is 'country'
export interface BarplotProps extends PlotProps {
  /** the data series - e.g. one per overlay variable value (sex: 'male', 'female') */
  data: {
    series: {
      /** The name of the data. e.g. 'male' or 'female' */
      name: string;
      /** The color of the data. Optional. */
      color?: string;
      value: number[];
      label: string[]; // e.g. India, Pakistan, Mali
    }[];
  };
  /** The orientation of the plot. Defaults to `vertical`  (--> general PlotProp?) */
  orientation: 'vertical' | 'horizontal';
  /** How bars are displayed when there are multiple series. */
  barLayout: 'overlay' | 'stack' | 'group';
  /** Opacity of bars. Range is a decimal between 0 and 1.   */
  opacity?: number;
  /** Title of plot. (should probably move to general PlotProps) */
  title?: string; // compulsory, unlike Histogram
  /** Label for independent axis. e.g. 'Country' */
  independentAxisLabel?: string;
  /** Label for dependent axis. Defaults to 'Count' */
  dependentAxisLabel?: string;
  /** Show value for each bar */
  showBarValues?: boolean;
  /** Should plot legend be displayed? */
  displayLegend?: boolean;
  /** Should plotting library controls be displayed? Ex. Plot.ly */
  displayLibraryControls?: boolean;
  /** Fill color of the title, axes labels, tick marks, and legend.
   * Defaults to DARK_GRAY. Note that textColor can be overridden
   * for the legend if `legendOptions` is provided. */
  textColor?: string;
  /** Color of the gridlines. Use Plotly defaults if not specified. */
  gridColor?: string;
  /** Control of background color. Defaults to transparent.  */
  backgroundColor?: string;
}

/** A Plotly-based Barplot component. */
export default function Barplot({
  data,
  width,
  height,
  orientation = 'vertical',
  title,
  //DKDK do not set default values for axisLabels
  independentAxisLabel,
  dependentAxisLabel,
  showBarValues = false,
  textColor = DARK_GRAY,
  gridColor,
  opacity = 1,
  barLayout = 'overlay',
  backgroundColor = 'transparent',
  displayLegend = true,
  displayLibraryControls = true,
  ...props
}: BarplotProps) {
  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.series.map((el: any) => {
        let calculatedOpacity = 1;

        //DKDK set opacity less than unity for overlay & multiple data
        if (barLayout === 'overlay' && data.series.length > 1)
          calculatedOpacity = opacity * 0.75;

        //DKDK check data exist
        if (el.label && el.value) {
          return {
            x: orientation === 'vertical' ? el.label : el.value,
            y: orientation === 'vertical' ? el.value : el.label,
            name: el.name, //DKDK legend name
            orientation: orientation === 'vertical' ? 'v' : 'h',
            opacity: calculatedOpacity,
            type: 'bar',
          };
        } else {
          return {};
        }
      }),
    [data, barLayout, orientation]
  );

  // Quirk of Plotly library. If you don't do this, the
  // plot will not refresh on barLayout changes.
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    setRevision(revision + 1);
  }, [barLayout]);

  const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
    // type: data?.valueType === 'date' ? 'date' : 'linear',
    automargin: true,
    title: {
      text: independentAxisLabel ? independentAxisLabel : '',
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 14,
      },
    },
  };

  const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
    automargin: true,
    title: {
      text: dependentAxisLabel ? dependentAxisLabel : '',
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 14,
      },
    },
    color: textColor,
    gridcolor: gridColor,
  };

  const layout: Partial<Layout> = {
    xaxis:
      orientation === 'vertical' ? independentAxisLayout : dependentAxisLayout,
    yaxis:
      orientation === 'vertical' ? dependentAxisLayout : independentAxisLayout,
    title: {
      text: title ? title : '',
    },
    barmode: barLayout,
  };

  return (
    <PlotlyPlot
      data={plotlyFriendlyData}
      revision={revision}
      layout={{
        ...layout,
        ...{
          autosize: true,
          width: width,
          height: height,
          margin: props.margin ? props.margin : undefined,
          showlegend: displayLegend,
          selectdirection: orientation === 'vertical' ? 'h' : 'v',
        },
      }}
      config={{
        displayModeBar: displayLibraryControls ? 'hover' : false,
        staticPlot: props.staticPlot ? props.staticPlot : false,
      }}
    />
  );
}
