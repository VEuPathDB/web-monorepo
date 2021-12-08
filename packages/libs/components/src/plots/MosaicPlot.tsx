import React, { useMemo } from 'react';
import {
  DEFAULT_CONTAINER_HEIGHT,
  DEFAULT_MAX_LEGEND_TEXT_LENGTH,
  makePlotlyPlotComponent,
  PlotProps,
} from './PlotlyPlot';
import { MosaicPlotData } from '../types/plots';
import { PlotParams } from 'react-plotly.js';
import _ from 'lodash';
// util functions for handling long tick labels with ellipsis
import { axisTickLableEllipsis } from '../utils/axis-tick-label-ellipsis';
import { makeStyles } from '@material-ui/core/styles';
import { PlotSpacingDefault } from '../types/plots/addOns';
import { Layout } from 'plotly.js';

export interface MosaicPlotProps extends PlotProps<MosaicPlotData> {
  /** label for independent axis */
  independentAxisLabel?: string;
  /** label for dependent axis */
  dependentAxisLabel?: string; // TO DO: standardise across all plots
  /** colors for dependent axis */ colors?: Array<string>;
  /** Show column labels */
  showColumnLabels?: boolean;
}

export const EmptyMosaicData: MosaicPlotData = {
  values: [[]],
  independentLabels: [],
  dependentLabels: [],
};

const useStyles = makeStyles({
  root: {
    '& .legend .traces .legendtoggle': {
      // Remove the click/pointer cursor from legend items
      cursor: 'default !important',
    },
  },
});

const getLongestTruncatedStringLength = (
  strings: string[],
  maxLength: number
) => {
  const longestStringLength = Math.max(...strings.map((str) => str.length));
  // If the length overflows, add two characters to account for ellipsis length
  return longestStringLength > maxLength ? maxLength + 2 : longestStringLength;
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
    containerClass,
    // Pull legend props out to ignore them. Mosaic's left legend doesn't really
    // function as a legend and is less flexible by necessity
    displayLegend,
    legendOptions,
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
        )
          // now replace labels for any all-zero 'series' with a white space
          // (tried an empty string but it causes major weirdness)
          .map((label, index) =>
            _.unzip(data.values)[index].every((v) => v === 0) ? ' ' : label
          ),
      [data]
    );

    const column_centers = percent_widths.map((width, i) => {
      // Sum of the widths of previous columns
      const column_start = _.sum(percent_widths.slice(0, i));
      return column_start + width / 2;
    });

    // ploltly.js default for left, bottom, and right margins is the same
    const defaultMargin = 80;
    const defaultMarginTop = 100;

    // Not currently calculating this---just using the default
    // Might need to be calculated or adjusted if more flexibility is needed
    const defaultLegendItemHeight = 20;

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

    // The gap between each legend item
    let legendTraceGroupGap: number | undefined;

    if (containerHeight) {
      // Estimate the plot proper height
      const marginTop = spacingOptions?.marginTop ?? defaultMarginTop;
      const marginBottom = spacingOptions?.marginBottom ?? defaultMargin;
      const longestIndependentTickLabelLength = getLongestTruncatedStringLength(
        data.independentLabels,
        maxIndependentTickLabelLength
      );
      // Subtraction at end is due to x-axis automargin shrinking the plot
      let plotHeight =
        containerHeight -
        marginTop -
        marginBottom -
        8 * longestIndependentTickLabelLength;
      if (!independentAxisLabel) plotHeight -= 20;
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
    const longestLegendLabelLength = getLongestTruncatedStringLength(
      data.dependentLabels,
      maxLegendTextLength
    );
    // Extra left margin and y-axis title standoff calculations are weird due
    // to y-axis automargin
    const marginLeftExtra = 5.357 * longestLegendLabelLength + 37.5;
    const yAxisTitleStandoff = marginLeftExtra + 25;

    const marginLeft =
      spacingOptions?.marginLeft ?? PlotSpacingDefault.marginLeft;
    const newSpacingOptions = {
      ...spacingOptions,
      marginLeft: marginLeft + marginLeftExtra,
    };

    const layout: Partial<Layout> = {
      xaxis: {
        title: independentAxisLabel,
        tickvals: column_centers,
        tickangle: 90,
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
    } as Partial<Layout>;

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

    const classes = useStyles();

    return {
      data: plotlyReadyData,
      layout,
      // original independent axis tick labels for tooltip
      storedIndependentAxisTickLabel: data.independentLabels,
      spacingOptions: newSpacingOptions,
      containerClass: classes.root,
      displayLegend: true,
      ...restProps,
    };
  }
);

export default MosaicPlot;
