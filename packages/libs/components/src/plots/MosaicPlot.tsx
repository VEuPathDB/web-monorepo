import React, { useMemo } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { MosaicData } from '../types/plots';
import { PlotParams } from 'react-plotly.js';
import _ from 'lodash';
// util functions for handling long tick labels with ellipsis
import { axisTickLableEllipsis } from '../utils/axis-tick-label-ellipsis';

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
    spacingOptions,
    ...restProps
  }: MosaicPlotProps) => {
    // Column widths
    const raw_widths = _.unzip(data.values).map((arr) => _.sum(arr));
    const sum_raw_widths = _.sum(raw_widths);
    const percent_widths = raw_widths.map(
      (width) => (width / sum_raw_widths) * 100
    );

    // set tick label Length for ellipsis
    const maxIndependentTickLabelLength = 20;

    // change data.independentLabels to have ellipsis
    const independentLabelsEllipsis = useMemo(
      () =>
        axisTickLableEllipsis(
          data.independentLabels,
          maxIndependentTickLabelLength
        ),
      [data]
    );

    const column_centers = percent_widths.map((width, i) => {
      // Sum of the widths of previous columns
      const column_start = _.sum(percent_widths.slice(0, i));
      return column_start + width / 2;
    });

    const heightProp = restProps.containerStyles?.height;
    const height = heightProp
      ? typeof heightProp === 'string'
        ? heightProp.endsWith('px')
          ? parseInt(heightProp)
          : 100
        : heightProp
      : 100;
    const marginTop = spacingOptions?.marginTop ?? 100;
    const marginBottom = spacingOptions?.marginTop ?? 80;
    const plotHeight = height - marginTop - marginBottom;

    const maxLegendTextLength = restProps.maxLegendTextLength ?? 20;
    const longestDependentLabelLength = Math.max(
      ...data.dependentLabels.map((label) => label.length)
    );
    const longestLegendLabelLength =
      longestDependentLabelLength > maxLegendTextLength
        ? maxLegendTextLength + 2
        : longestDependentLabelLength;
    const marginLeftExtra = 5.357 * longestLegendLabelLength + 37.5;
    const yAxisTitleStandoff = marginLeftExtra + 25;

    const marginleft = spacingOptions?.marginLeft ?? 80;
    // const marginLeftExtra = 75;
    // const yAxisTitleStandoff = 100;
    const newSpacingOptions = {
      ...spacingOptions,
      marginLeft: marginleft + marginLeftExtra,
    };

    const layout = {
      xaxis: {
        title: independentAxisLabel,
        tickvals: column_centers,
        ticktext:
          showColumnLabels !== false
            ? // use ellipsis texts here
              independentLabelsEllipsis
            : new Array(data.independentLabels.length).fill(''),
        range: [0, 100] as number[],
        // this is required to separate axis tick label from axis title
        automargin: true,
      },
      yaxis: {
        title: {
          text: dependentAxisLabel && dependentAxisLabel + ' (Proportion)',
          // standoff: yAxisTitleStandoff * 1.33,
          standoff: yAxisTitleStandoff,
        },
        range: [0, 100] as number[],
        // tickvals: [0, 20, 40, 60, 80, 100] as number[],
        tickvals: [] as number[],
        automargin: true,
      },
      barmode: 'stack',
      barnorm: 'percent',
      legend: {
        xanchor: 'right',
        x: -0.01,
        y: 0.5,
        tracegroupgap: plotHeight / data.dependentLabels.length,
        // traceorder: 'reversed+grouped',
        itemclick: false,
        itemdoubleclick: false,
      },
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
            legendgroup: data.dependentLabels[i],
            // legendrank: data.dependentLabels.length - i,
            legendrank: i + 1,
          } as const)
      )
      .reverse(); // Reverse so first trace is on top, matching data array

    return {
      data: plotlyReadyData,
      layout,
      // original independent axis tick labels for tooltip
      storedIndependentAxisTickLabel: data.independentLabels,
      spacingOptions: newSpacingOptions,
      ...restProps,
    };
  }
);

export default MosaicPlot;
