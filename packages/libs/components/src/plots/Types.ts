// Added Types.ts back attempting to extend plotly.js types
import React from 'react';
import { PlotData as PlotlyPlotData } from 'plotly.js';
import { PlotParams as ReactPlotlyPlotParams } from 'react-plotly.js';

export interface PlotData extends Omit<PlotlyPlotData, 'hoverinfo'> {
  hoverinfo: PlotlyPlotData['hoverinfo'] | PlotlyPlotData['textinfo'],
  sort: boolean;
}

export type Data = Partial<PlotData>;

export interface PlotParams extends Omit<ReactPlotlyPlotParams, 'data'> {
  data: Data[];
}

export class Plot extends React.PureComponent<PlotParams> {}
