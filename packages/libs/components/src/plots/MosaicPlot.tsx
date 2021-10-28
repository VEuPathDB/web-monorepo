import React, { useMemo } from 'react';
import {
  DEFAULT_CONTAINER_HEIGHT,
  DEFAULT_MAX_LEGEND_TEXT_LENGTH,
  makePlotlyPlotComponent,
  PlotProps,
} from './PlotlyPlot';
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

    // Not currently calculating this---just using the default
    // Might need to be calculated or adjusted if more flexibility is needed
    const defaultLegendItemHeight = 20;
    // ploltly.js default for left, bottom, and right margins is the same
    const defaultMargin = 80;
    const defaultMarginTop = 100;

    // Try to get the container height in pixels
    const containerHeightProp = restProps.containerStyles
      ? restProps.containerStyles.height
      : DEFAULT_CONTAINER_HEIGHT;
    const containerHeight = containerHeightProp
      ? typeof containerHeightProp === 'number'
        ? containerHeightProp
        : containerHeightProp.endsWith('px')
        ? parseInt(containerHeightProp)
        : undefined
      : undefined;
    let legendTraceGroupGap: number;

    if (containerHeight) {
      // Estimate the plot proper height
      const marginTop = spacingOptions?.marginTop ?? defaultMarginTop;
      const marginBottom = spacingOptions?.marginBottom ?? defaultMargin;
      // Subtraction at end is due to x-axis automargin shrinking the plot
      const plotHeight =
        containerHeight -
        marginTop -
        marginBottom -
        2.05 * (maxIndependentTickLabelLength + 2);
      // Calculate the legend trace group gap accordingly
      legendTraceGroupGap =
        ((plotHeight - defaultLegendItemHeight * data.dependentLabels.length) *
          0.95) /
        (data.dependentLabels.length - 1);
    } else {
      // If we can't determine the container height, don't add any gaps to be safe
      legendTraceGroupGap = 0;
    }

    const maxLegendTextLength =
      restProps.maxLegendTextLength ?? DEFAULT_MAX_LEGEND_TEXT_LENGTH;
    const longestDependentLabelLength = Math.max(
      ...data.dependentLabels.map((label) => label.length)
    );
    // If the length overflows, add two characters to account for ellipsis length
    const longestLegendLabelLength =
      longestDependentLabelLength > maxLegendTextLength
        ? maxLegendTextLength + 2
        : longestDependentLabelLength;
    // Have to calculate some extra left margin and y axis title standoff due
    // to y-axis automargin
    const marginLeftExtra = 5.357 * longestLegendLabelLength + 37.5;
    const yAxisTitleStandoff = marginLeftExtra + 25;

    const marginleft = spacingOptions?.marginLeft ?? 80;
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
          standoff: yAxisTitleStandoff,
        },
        range: [0, 100] as number[],
        tickvals: [] as number[],
        automargin: true,
      },
      barmode: 'stack',
      barnorm: 'percent',
      legend: {
        xanchor: 'right',
        x: -0.01,
        y: 0.5,
        tracegroupgap: legendTraceGroupGap,
        itemclick: false,
        itemdoubleclick: false,
      },
      hovermode: 'x',
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
            legendrank: i,
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
