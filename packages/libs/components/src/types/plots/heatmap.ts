/**
 * Note that this is NOT an array of data traces/series because you can't show
 * more than one in a heatmap (well, I guess you could cut each cell diagonally
 * in half to show two traces but let's not go there).
 *
 * Both x and y axes are "independent" so are named simply as x and y
 */

export type HeatmapData = {
  /** labels for the x axis  */
  xLabels: number[] | string[];
  /** labels for the y axis  */
  yLabels: number[] | string[];
  /** 'hotness' values [y][x] */
  values: number[][];
};
