import React, { useMemo } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { Layout, Annotations } from 'plotly.js';
import { HeatmapData } from '../types/plots';

export interface HeatmapProps extends PlotProps<HeatmapData> {
  /** Label for x axis. Both x and y axes have "independent" variables */
  // TO DO: rename to independent and dependent - see https://epvb.slack.com/archives/C012X6FPVB4/p1624543299066000
  xAxisLabel?: string;
  /** Label for y axis. */
  yAxisLabel?: string;
  /** Show values as text in heatmap */
  showValues?: boolean;
  //DKDK add zsmooth here so that it can be treated as a Props out of data
  zSmooth?: 'fast' | 'best' | false;
}

const EmptyHeatmapData: HeatmapData = {
  xLabels: [],
  yLabels: [],
  values: [[]],
};

const Heatmap = makePlotlyPlotComponent('Heatmap', (props: any) => {
  const {
    data = EmptyHeatmapData,
    xAxisLabel,
    yAxisLabel,
    showValues,
    zSmooth,
    legendTitle, // needs to be handled here via colorbar, not main legend in PlotlyPlot
    ...restProps
  } = props;

  const isEmptyData = useMemo(() => data.values.flat().length == 0, [data]);

  const layout: Partial<Layout> = {
    //DKDK set annotations for displaying values at each cell
    annotations: [],
    xaxis: {
      title: xAxisLabel,
      mirror: true,
      showgrid: false,
      tickfont: isEmptyData ? { color: 'transparent' } : {},
      zeroline: false, // for empty plot, mainly
      nticks: isEmptyData ? 5 : data.xLabels.length + 1,
    },
    yaxis: {
      title: yAxisLabel,
      mirror: true,
      showgrid: false,
      tickfont: isEmptyData ? { color: 'transparent' } : {},
      zeroline: false, // for empty plot, mainly
      nticks: isEmptyData ? 5 : data.yLabels.length + 1,
    },
  };

  //DKDK add value texts at each cell when props.showValue = true
  if (showValues) {
    for (let i = 0; i < data.yLabels.length; i++) {
      for (let j = 0; j < data.xLabels.length; j++) {
        let result: Partial<Annotations> = {
          xref: 'x',
          yref: 'y',
          x: data.xLabels[j],
          y: data.yLabels[i],
          //DKDK zValues(i.e., z) is number[][] so converting it into string to avoid type error
          text: data.values[i][j]?.toString(),
          font: {
            color: 'white', // TO DO: generate color more intelligently
            // taking palette/gradient into consideration too
            // (white works just-about OK on top of the default blue-grey-red gradient)
          },
          showarrow: false,
        };
        //DKDK set condition to avoid type error
        layout.annotations ? layout.annotations.push(result) : [];
      }
    }
  }

  const finalData = [
    {
      x: data.xLabels,
      y: data.yLabels,
      z: data.values,
      type: 'heatmap' as const,
      zsmooth: zSmooth,
      colorbar: {
        title: {
          text: legendTitle,
        },
      },
    },
  ];

  return {
    data: finalData,
    layout,
    ...restProps,
  };
});

export default Heatmap;
