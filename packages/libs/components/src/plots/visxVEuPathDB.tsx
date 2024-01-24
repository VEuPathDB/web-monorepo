/** Helpful styles and types for working with visx */

import domToImage from 'dom-to-image';
import { ToImgopts } from 'plotly.js';

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

export async function plotToImage(
  plotElement: HTMLElement | null,
  imgOpts: ToImgopts
) {
  if (!plotElement) throw new Error('Plot not ready');
  const opts = { ...imgOpts, bgcolor: 'white' };
  switch (opts.format) {
    case 'jpeg':
      return domToImage.toJpeg(plotElement, opts);
    case 'png':
      return domToImage.toPng(plotElement, opts);
    case 'svg': {
      const svgRoot = plotElement.querySelector('svg');
      if (!svgRoot) throw new Error('Plot not ready');
      //get svg source.
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgRoot);

      //add name spaces.
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
        );
      }

      //add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      const svgBlob = new Blob([source], {
        type: 'image/svg+xml;charset=utf-8',
      });
      var svgUrl = URL.createObjectURL(svgBlob);
      return svgUrl;
    }
    default:
      return '';
  }
}
