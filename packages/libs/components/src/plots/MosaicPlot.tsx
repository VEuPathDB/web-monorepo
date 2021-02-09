import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';

interface Props extends PlotProps {
  // N columns/exposure, M rows/outcome
  data: Array<Array<number>>; // MxN (M = outerLength; N = innerLength)
  exposureValues: Array<string>; // N
  outcomeValues: Array<string>; // M
  exposureLabel: string;
  outcomeLabel: string;
  widths: Array<number>; // N
  colors?: Array<string>; // M
  showLegend?: boolean;
  showModebar?: boolean;
}

export default function MosaicPlot(props: Props) {
  const column_centers = props.widths.map((width, i) => {
    // Sum of the widths of previous columns
    let column_start = props.widths.slice(0, i).reduce((a, b) => a + b, 0);
    return column_start + width / 2;
  });

  const layout = {
    xaxis: {
      title: props.exposureLabel,
      // Must expliticly define range for it to work consistently
      range: [0, props.widths.reduce((a, b) => a + b, 0)] as number[],
      tickvals: column_centers,
      ticktext: props.exposureValues,
    },
    yaxis: {
      title: props.outcomeLabel,
    },
    barmode: 'stack',
  } as const;

  const data = props.data
    .map(
      (vals, i) =>
        ({
          x: column_centers,
          y: vals,
          name: props.outcomeValues[i],
          width: props.widths,
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
      layout={Object.assign(layout, {
        width: props.width,
        height: props.height,
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
