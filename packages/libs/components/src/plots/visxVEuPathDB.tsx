/** Helpful styles and types for working with visx */

import domToImage from 'dom-to-image';

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

export async function downloadSvg(node: HTMLElement | null) {
  if (node == null) return;

  const svgUrl = await domToImage.toSvg(node, { height: 800, width: 1000 });
  const downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = 'plot.svg';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
