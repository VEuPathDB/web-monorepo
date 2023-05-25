import React from 'react';
import L from 'leaflet';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from './BoundsDriftMarker';

import {
  MarkerScaleAddon,
  MarkerScaleDefault,
  ContainerStylesAddon,
} from '../types/plots';

import { last } from 'lodash';

// ts definition for HistogramMarkerSVGProps: need some adjustment but for now, just use bubble marker one
export interface BubbleMarkerProps
  extends BoundsDriftMarkerProps,
    MarkerScaleAddon {
  data: {
    //TODO: will bubble size depend on either data.value relatively or backend response?
    value: number;
    label: string;
    color?: string;
  }[];
  // isAtomic: add a special thumbtack icon if this is true
  isAtomic?: boolean;
  onClick?: (event: L.LeafletMouseEvent) => void | undefined;
  /** center title/number for marker (defaults to sum of data[].value) */
  markerLabel?: string;
  /** cumulative mode: values are expected in order and to **already** be cumulative in nature.
   * That is, values 20, 40, 60, 80, 100 would generate five equal-sized segments.  The final
   * value does not have to be 100.  2,4,6,8,10 would produce the same bubble
   * (but with different mouse-overs in the enlarged version.) */
  cumulative?: boolean;
}

/**
 * this is a SVG bubble marker icon
 */
export default function BubbleMarker(props: BubbleMarkerProps) {
  const {
    html: svgHTML,
    size,
    markerLabel,
    sliceTextOverrides,
  } = bubbleMarkerSVGIcon(props);

  // set icon as divIcon
  const SVGBubbleIcon: any = L.divIcon({
    className: 'leaflet-canvas-icon', // may need to change this className but just leave it as it for now
    iconSize: new L.Point(size, size), // this will make icon to cover up SVG area!
    iconAnchor: new L.Point(size / 2, size / 2), // location of topleft corner: this is used for centering of the icon like transform/translate in CSS
    html: svgHTML, // divIcon HTML svg code generated above
  });

  // anim check duration exists or not
  const duration: number = props.duration ? props.duration : 300;

  return (
    <BoundsDriftMarker
      id={props.id}
      position={props.position}
      bounds={props.bounds}
      icon={SVGBubbleIcon}
      duration={duration}
    />
  );
}

type BubbleMarkerStandaloneProps = Omit<
  BubbleMarkerProps,
  | 'id'
  | 'position'
  | 'bounds'
  | 'onClick'
  | 'duration'
  | 'showPopup'
  | 'popupClass'
  | 'popupContent'
> &
  ContainerStylesAddon;

export function BubbleMarkerStandalone(props: BubbleMarkerStandaloneProps) {
  const { html, size } = bubbleMarkerSVGIcon(props);
  // NOTE: the font size and line height would normally come from the .leaflet-container class
  // but we won't be using that. You can override these with `containerStyles` if you like.
  return (
    <div
      style={{
        fontSize: '12px',
        lineHeight: 1.5,
        width: size,
        height: size,
        ...props.containerStyles,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function bubbleMarkerSVGIcon(props: BubbleMarkerStandaloneProps): {
  html: string;
  size: number;
  sliceTextOverrides: string[];
  markerLabel: string;
} {
  const scale = props.markerScale ?? MarkerScaleDefault;
  const size = 40 * scale;
  // set outter white circle size to describe white boundary
  const backgroundWhiteCircleRadius = size / 2 + size / 16;

  let svgHTML: string = '';

  // set drawing area
  svgHTML +=
    '<svg width="' +
    backgroundWhiteCircleRadius * 2 +
    '" height="' +
    backgroundWhiteCircleRadius * 2 +
    '">'; // initiate svg marker icon

  // what value corresponds to 360 degrees of the circle?
  // regular mode: summation of fullStat.value per marker icon
  // cumulative mode: take the last value
  const fullPieValue: number = props.cumulative
    ? last(props.data)?.value ?? 0
    : props.data
        .map((o) => o.value)
        .reduce((a, c) => {
          return a + c;
        });

  // for display, convert large value with k (e.g., 12345 -> 12k): return original value if less than a criterion
  const sumLabel = props.markerLabel ?? String(fullPieValue);

  // draw a larger white-filled circle
  svgHTML +=
    '<circle cx="' +
    backgroundWhiteCircleRadius +
    '" cy="' +
    backgroundWhiteCircleRadius +
    '" r="' +
    backgroundWhiteCircleRadius +
    '" stroke="green" stroke-width="0" fill="white" />';

  // set start point of arc = 0
  let cumulativeSum = 0;
  const sliceTextOverrides: string[] = [];

  // create bubbles
  props.data.forEach(function (el) {
    // if fullPieValue = 0, do not draw arc
    if (fullPieValue > 0) {
      // compute the ratio of each data to the total number
      const thisValue = el.value - cumulativeSum; // subtracts nothing if not in cumulative mode, see below

      if (props.cumulative)
        // only sum up in cumulative mode
        cumulativeSum += thisValue;

      //TODO: two things to consider: a) bubble size; b) bubble color
      svgHTML +=
        '<circle cx="' +
        backgroundWhiteCircleRadius +
        '" cy="' +
        backgroundWhiteCircleRadius +
        '" r="' +
        size / 2 +
        '" stroke="green" stroke-width="0" fill="' +
        el.color +
        '" />';
    }
  });

  //TODO: do we need to show total number for bubble marker?
  // adding total number text/label and centering it
  svgHTML +=
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="1em">' +
    sumLabel +
    '</text>';

  // check isAtomic: draw pushpin if true
  if (props.isAtomic) {
    let pushPinCode = '&#128392;';
    svgHTML +=
      '<text x="86%" y="14%" dominant-baseline="middle" text-anchor="middle" opacity="0.75" font-weight="bold" font-size="1.2em">' +
      pushPinCode +
      '</text>';
  }

  // closing svg tag
  svgHTML += '</svg>';

  return { html: svgHTML, size, sliceTextOverrides, markerLabel: sumLabel };
}
