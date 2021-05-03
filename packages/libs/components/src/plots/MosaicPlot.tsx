import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
import _ from 'lodash';

export interface Props extends Omit<PlotProps, 'width' | 'height'> {
  // N columns, M rows
  data: Array<Array<number>>; // MxN (M = outerLength; N = innerLength)
  xValues: Array<string>; // N
  yValues: Array<string>; // M
  xLabel: string;
  yLabel: string;
  colors?: Array<string>; // M
  showLegend?: boolean;
  showModebar?: boolean;
  width?: number | string;
  height?: number | string;
}

export default function MosaicPlot(props: Props) {
  const column_widths = _.unzip(props.data).map((arr) => _.sum(arr));
  const sum_column_widths = _.sum(column_widths);

  const column_centers = column_widths.map((width, i) => {
    // Sum of the widths of previous columns
    let column_start = _.sum(column_widths.slice(0, i));
    return column_start + width / 2;
  });

  const layout = {
    xaxis: {
      title: props.xLabel,
      // Must expliticly define range for it to work consistently
      range: [0, sum_column_widths] as number[],
      tickvals: column_centers,
      ticktext: props.xValues,
      // Shows x-axis counts similar to y-axis hover labels
      // ticktext: props.xValues.map((value, i) => `${value}: ${(column_widths[i]/sum_column_widths*100).toFixed(1)}% (${column_widths[i]})`),
    },
    yaxis: {
      title: props.yLabel ? props.yLabel + ' (%)' : '',
    },
    barmode: 'stack',
    barnorm: 'percent',
  } as const;

  const data = props.data
    .map(
      (counts, i) =>
        ({
          x: column_centers,
          y: counts,
          name: props.yValues[i],
          hoverinfo: 'text',
          hovertext: counts.map(
            (count, j) =>
              `${props.yValues[i]}: ${(
                (count / column_widths[j]) *
                100
              ).toFixed(1)}% (${count})`
          ),
          width: column_widths,
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
