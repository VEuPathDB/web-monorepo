import React from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { MosaicData } from '../types/plots';
import { PlotParams } from 'react-plotly.js';
import _ from 'lodash';

export interface MosaicPlotProps extends PlotProps<MosaicData> {
  /** label for independent axis */
  independentAxisLabel?: string;
  /** label for dependent axis */
  dependentAxisLabel?: string; // TO DO: standardise across all plots
  /** colors for dependent axis */ colors?: Array<string>;
  /** Show column labels */
  showColumnLabels?: boolean;
}

const EmptyMosaicData: MosaicData = {
  values: [[]],
  independentLabels: [],
  dependentLabels: [],
};

export default function MosaicPlot({
  data = EmptyMosaicData,
  independentAxisLabel,
  dependentAxisLabel,
  colors,
  showColumnLabels,
  ...restProps
}: MosaicPlotProps) {
  // Column widths
  const raw_widths = _.unzip(data.values).map((arr) => _.sum(arr));
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
      title: independentAxisLabel ? independentAxisLabel + ' (%)' : '',
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
        showColumnLabels !== false
          ? data.independentLabels.map(
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
      title: dependentAxisLabel ? dependentAxisLabel + ' (%)' : '',
      range: [0, 100] as number[],
      tickvals: [0, 20, 40, 60, 80, 100] as number[],
    },
    barmode: 'stack',
    barnorm: 'percent',
  } as const;

  const plotlyReadyData: PlotParams['data'] = data.values
    .map(
      (counts, i) =>
        ({
          x: column_centers,
          y: counts,
          name: data.dependentLabels[i],
          hoverinfo: 'text',
          hovertext: counts.map(
            (count, j) =>
              `<b>${data.dependentLabels[i]}</b> ${(
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
            color: colors ? colors[i] : undefined,
          },
        } as const)
    )
    .reverse(); // Reverse so first trace is on top, matching data array

  // Add empty trace to show second x axis
  if (showColumnLabels !== false) plotlyReadyData.push({ xaxis: 'x2' });

  // set reverseLegendTooltips as true for Mosaic plot: default is false
  return (
    <PlotlyPlot
      data={plotlyReadyData}
      layout={layout}
      reverseLegendTooltips={true}
      {...restProps}
    />
  );
}
