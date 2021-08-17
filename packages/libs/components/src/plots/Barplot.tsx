import { useMemo } from 'react';
import { PlotParams } from 'react-plotly.js';
import {
  BarLayoutAddon,
  BarplotData,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
  DependentAxisLogScaleAddon,
  DependentAxisLogScaleDefault,
  ColorPaletteAddon,
} from '../types/plots';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { Layout } from 'plotly.js';
import { some } from 'lodash';

// in this example, the main variable is 'country'
export interface BarplotProps
  extends PlotProps<BarplotData>,
    BarLayoutAddon<'overlay' | 'stack' | 'group'>,
    OrientationAddon,
    OpacityAddon,
    DependentAxisLogScaleAddon,
    ColorPaletteAddon {
  /** Label for independent axis. e.g. 'Country' */
  independentAxisLabel?: string;
  /** Label for dependent axis. Defaults to 'Count' */
  dependentAxisLabel?: string;
  /** Show value for each bar */
  showValues?: boolean;
  /** show/hide independent axis tick label, default is true */
  showIndependentAxisTickLabel?: boolean;
  /** show/hide dependent axis tick label, default is true */
  showDependentAxisTickLabel?: boolean;
}

const EmptyBarplotData: BarplotData = { series: [] };

/** A Plotly-based Barplot component. */
export default function Barplot({
  data = EmptyBarplotData,
  independentAxisLabel,
  dependentAxisLabel,
  showValues = false,
  orientation = OrientationDefault,
  opacity = OpacityDefault,
  barLayout = 'group',
  showIndependentAxisTickLabel = true,
  showDependentAxisTickLabel = true,
  dependentAxisLogScale = DependentAxisLogScaleDefault,
  ...restProps
}: BarplotProps) {
  // Transform `data` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.series.map((el: any) => {
        // set opacity only for overlay & multiple data
        const calculatedOpacity =
          barLayout === 'overlay' && data.series.length > 1 ? opacity : 1;

        // check data exist
        if (el.label && el.value) {
          return {
            x: orientation === 'vertical' ? el.label : el.value,
            y: orientation === 'vertical' ? el.value : el.label,
            name: el.name, // legend name
            orientation: orientation === 'vertical' ? 'v' : 'h',
            opacity: calculatedOpacity,
            type: 'bar',
            text: showValues ? el.value : undefined,
            textposition: showValues ? 'auto' : undefined,
            marker: {
              ...(el.color ? { color: el.color } : {}),
            },
          };
        } else {
          return {};
        }
      }),
    [data, barLayout, orientation, showValues, opacity]
  );

  const independentAxisLayout: Layout['xaxis'] | Layout['yaxis'] = {
    automargin: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    title: {
      text: independentAxisLabel ? independentAxisLabel : '',
    },
    range: data.series.length ? undefined : [0, 10],
    tickfont: data.series.length ? {} : { color: 'transparent' },
    showticklabels: showIndependentAxisTickLabel,
  };

  // if at least one value is 0 < x < 1 then these are probably fractions/proportions
  // affects mouseover formatting only in logScale mode
  // worst case is that mouseovers contain integers followed by .0000
  const dataLooksFractional = useMemo(() => {
    return some(
      data.series.flatMap((series) => series.value),
      (val) => val > 0 && val < 1
    );
  }, [data.series]);

  const dependentAxisLayout: Layout['yaxis'] | Layout['xaxis'] = {
    automargin: true,
    tickformat: dependentAxisLogScale ? ',.1r' : undefined, // comma-separated thousands, rounded to 1 significant digit
    hoverformat: dependentAxisLogScale
      ? dataLooksFractional
        ? ',.4f'
        : ',.0f'
      : undefined,
    type: dependentAxisLogScale ? 'log' : 'linear',
    title: {
      text: dependentAxisLabel ? dependentAxisLabel : '',
    },
    tickfont: data.series.length ? {} : { color: 'transparent' },
    range: data.series.length ? undefined : [0, 10],
    showticklabels: showDependentAxisTickLabel,
  };

  const layout: Partial<Layout> = {
    xaxis:
      orientation === 'vertical' ? independentAxisLayout : dependentAxisLayout,
    yaxis:
      orientation === 'vertical' ? dependentAxisLayout : independentAxisLayout,
    barmode: barLayout,
  };

  return (
    <PlotlyPlot data={plotlyFriendlyData} layout={layout} {...restProps} />
  );
}
