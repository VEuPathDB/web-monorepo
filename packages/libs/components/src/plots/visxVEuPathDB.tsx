/** Helpful styles and types for working with visx */

/**
 * Types
 */

// Basic x,y point. Comes in handy for annotations and other non-data plotted elements
export type VisxPoint = {
  x?: number;
  y?: number;
};

/**
 * Plot styles
 * (can eventually be moved to a visx theme)
 */
export const thresholdLineStyles = {
  stroke: '#aaaaaa',
  strokeWidth: 1,
  strokeDasharray: 3,
};
export const axisStyles = {
  stroke: '#bbbbbb',
  strokeWidth: 1,
};
export const gridStyles = {
  stroke: '#dddddd',
  strokeWidth: 0.5,
};
