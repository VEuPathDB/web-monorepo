// import React from 'react';
import L from 'leaflet';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from './BoundsDriftMarker';

import {
  MarkerScaleAddon,
  MarkerScaleDefault,
  ContainerStylesAddon,
} from '../types/plots';
import { NumberRange } from '../types/general';

// ts definition for HistogramMarkerSVGProps: need some adjustment but for now, just use bubble marker one
export interface BubbleMarkerProps extends BoundsDriftMarkerProps {
  data: {
    value: number;
    label: string;
    color?: string;
  }[];
  // isAtomic: add a special thumbtack icon if this is true
  isAtomic?: boolean;
  dependentAxisRange?: NumberRange | null; // y-axis range for setting global max
  valueToDiameterMapper: (value: number) => number;
  onClick?: (event: L.LeafletMouseEvent) => void | undefined;
}

/**
 * this is a SVG bubble marker icon
 */
export default function BubbleMarker(props: BubbleMarkerProps) {
  const { html: svgHTML, diameter: size } = bubbleMarkerSVGIcon(props);

  // set icon as divIcon
  const SVGBubbleIcon = L.divIcon({
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
      icon={SVGBubbleIcon as L.Icon}
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
  const { html, diameter } = bubbleMarkerSVGIcon(props);
  // NOTE: the font size and line height would normally come from the .leaflet-container class
  // but we won't be using that. You can override these with `containerStyles` if you like.
  return (
    <div
      style={{
        fontSize: '12px',
        lineHeight: 1.5,
        width: diameter,
        height: diameter,
        ...props.containerStyles,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function bubbleMarkerSVGIcon(props: BubbleMarkerStandaloneProps): {
  html: string;
  diameter: number;
} {
  // const scale = props.markerScale ?? MarkerScaleDefault;
  console.log({ dependentAxisRange: props.dependentAxisRange });
  const diameter = props.valueToDiameterMapper(props.data[0].value);
  const radius = diameter / 2;
  // set outer white circle size to describe white boundary
  const strokeWidth = 2;
  const outlineRadius = radius + strokeWidth;

  let svgHTML: string = '';

  // set drawing area
  svgHTML +=
    '<svg width="' +
    outlineRadius * 2 +
    '" height="' +
    outlineRadius * 2 +
    '">'; // initiate svg marker icon

  console.log('here5');

  // for display, convert large value with k (e.g., 12345 -> 12k): return original value if less than a criterion
  // const sumLabel = props.markerLabel ?? String(fullPieValue);

  // draw a larger white-filled circle
  // svgHTML +=
  //   '<circle cx="' +
  //   circleRadius +
  //   '" cy="' +
  //   circleRadius +
  //   '" r="' +
  //   circleRadius +
  //   '" stroke="green" stroke-width="0" fill="white" />';

  // create bubble
  //TODO: two things to consider: a) bubble size; b) bubble color
  svgHTML +=
    '<circle cx="' +
    outlineRadius +
    '" cy="' +
    outlineRadius +
    '" r="' +
    outlineRadius +
    '" stroke="white" stroke-width="' +
    strokeWidth +
    '" fill="' +
    props.data[0].color +
    '" />';

  //TODO: do we need to show total number for bubble marker?
  // adding total number text/label and centering it
  svgHTML +=
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="1em">' +
    props.data[0].value +
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

  return { html: svgHTML, diameter: diameter };
}