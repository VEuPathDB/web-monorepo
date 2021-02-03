import { PlotData } from 'plotly.js';

export type LinePlotData = Array<{
  name: PlotData['name'];
  x: PlotData['x'];
  y: PlotData['y'];
  fill: PlotData['fill'];
  line: PlotData['line'];
}>;
