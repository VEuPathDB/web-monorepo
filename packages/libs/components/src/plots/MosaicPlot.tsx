import React from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
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

export const EmptyMosaicData: MosaicData = {
  values: [[]],
  independentLabels: [],
  dependentLabels: [],
};

const MosaicPlot = makePlotlyPlotComponent(
  'MosaicPlot',
  ({
    data = EmptyMosaicData,
    independentAxisLabel,
    dependentAxisLabel,
    colors,
    showColumnLabels,
    ...restProps
  }: MosaicPlotProps) => {
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
      xaxis: {
        title: independentAxisLabel,
        tickvals: column_centers,
        ticktext:
          showColumnLabels !== false
            ? data.independentLabels
            : new Array(data.independentLabels.length).fill(''),
        range: [0, 100] as number[],
      },
      yaxis: {
        title: dependentAxisLabel && dependentAxisLabel + ' (Proportion)',
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
                `<b>${data.dependentLabels[i]}</b> ${count.toLocaleString(
                  'en-US'
                )} (${((count / raw_widths[j]) * 100).toFixed(1)}%)`
            ),
            width: percent_widths,
            type: 'bar',
            marker: {
              line: {
                // Borders between blocks
                width: 1,
                color: 'white',
              },
              color: colors ? colors[i] : undefined,
            },
          } as const)
      )
      .reverse(); // Reverse so first trace is on top, matching data array

    return {
      data: plotlyReadyData,
      layout,
      legendTitle: dependentAxisLabel,
      ...restProps,
    };
  }
);

export default MosaicPlot;
