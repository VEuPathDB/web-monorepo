import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
import { PlotParams } from 'react-plotly.js';
import _ from 'lodash';

export interface Props extends Omit<PlotProps, 'width' | 'height'> {
  // N columns, M rows
  data: Array<Array<number>>; // MxN (M = outerLength; N = innerLength)
  independentValues: Array<string>; // N
  dependentValues: Array<string>; // M
  independentLabel: string;
  dependentLabel: string;
  colors?: Array<string>; // M
  showLegend?: boolean;
  showModebar?: boolean;
  showColumnLabels?: boolean;
  title?: string;
  titleSize?: number;
  width?: number | string;
  height?: number | string;
}

export default function MosaicPlot(props: Props) {
  // Column widths
  const raw_widths = _.unzip(props.data).map((arr) => _.sum(arr));
  const sum_raw_widths = _.sum(raw_widths);
  const percent_widths = raw_widths.map(
    (width) => (width / sum_raw_widths) * 100
  );

  const column_centers = percent_widths.map((width, i) => {
    // Sum of the widths of previous columns
    const column_start = _.sum(percent_widths.slice(0, i));
    return column_start + width / 2;
  });

  const layout = {
    // Bottom x axis displaying percent ticks
    xaxis: {
      title: props.independentLabel ? props.independentLabel + ' (%)' : '',
      // Must expliticly define range for it to work consistently
      range: [0, 100] as number[],
      tickvals: [0, 20, 40, 60, 80, 100] as number[],
      ticktext: ['', '20', '40', '60', '80', '100'] as string[],
      showgrid: true,
    },
    // Top x axis displaying independent variable labels
    xaxis2: {
      tickvals: column_centers,
      ticktext:
        props.showColumnLabels !== false
          ? props.independentValues.map(
              (value, i) =>
                `<b>${value}</b> ${percent_widths[i].toFixed(1)}% (${raw_widths[
                  i
                ].toLocaleString('en-US')})`
            )
          : undefined,
      range: [0, 100] as number[],
      overlaying: 'x',
      side: 'top',
    },
    yaxis: {
      title: props.dependentLabel ? props.dependentLabel + ' (%)' : '',
      range: [0, 100] as number[],
      tickvals: [0, 20, 40, 60, 80, 100] as number[],
    },
    barmode: 'stack',
    barnorm: 'percent',
    title: props.title
      ? {
          text: props.title,
          font: {
            size: props.titleSize,
          },
        }
      : undefined,
  } as const;

  let data: PlotParams['data'] = props.data
    .map(
      (counts, i) =>
        ({
          x: column_centers,
          y: counts,
          name: props.dependentValues[i],
          hoverinfo: 'text',
          hovertext: counts.map(
            (count, j) =>
              `<b>${props.dependentValues[i]}</b> ${(
                (count / raw_widths[j]) *
                100
              ).toFixed(1)}% (${count.toLocaleString('en-US')})`
          ),
          width: percent_widths,
          type: 'bar',
          marker: {
            line: {
              // Borders between blocks
              width: 2,
              color: 'white',
            },
            color: props.colors ? props.colors[i] : undefined,
          },
        } as const)
    )
    .reverse(); // Reverse so first trace is on top, matching data array

  // Add empty trace to show second x axis
  if (props.showColumnLabels !== false) data.push({ xaxis: 'x2' });

  return (
    <PlotlyPlot
      data={data}
      style={{ width: props.width, height: props.height }}
      layout={Object.assign(layout, {
        margin: props.margin,
        showlegend: props.showLegend,
      })}
      config={{
        displayModeBar:
          props.showModebar !== undefined ? props.showModebar : ModebarDefault,
        staticPlot: props.staticPlot,
      }}
    />
  );
}
