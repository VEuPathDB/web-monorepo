export type BarPlotDataSeries = {
  /** The name of the data. e.g. 'male' or 'female' */
  name: string;
  /** The color of the data. Optional. */
  color?: string | string[];
  /** The color of the bar outline. Optional. */
  borderColor?: string;
  /** The values that make the height of the bars */
  value: number[];
  /** The x-axis tick labels for the bars */
  label: string[]; // e.g. India, Pakistan, Mali
};

export type BarPlotData = {
  series: Array<BarPlotDataSeries>;
};
