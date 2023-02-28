import React from 'react';
import L from 'leaflet';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from './BoundsDriftMarker';

import PiePlot from '../plots/PiePlot';
import {
  MarkerScaleAddon,
  MarkerScaleDefault,
  PiePlotDatum,
  ContainerStylesAddon,
} from '../types/plots';

import { last } from 'lodash';

// ts definition for HistogramMarkerSVGProps: need some adjustment but for now, just use Donut marker one
export interface DonutMarkerProps
  extends BoundsDriftMarkerProps,
    MarkerScaleAddon {
  data: {
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
   * value does not have to be 100.  2,4,6,8,10 would produce the same donut
   * (but with different mouse-overs in the enlarged version.) */
  cumulative?: boolean;
}

// convert to Cartesian coord. toCartesian(centerX, centerY, Radius for arc to draw, arc (radian))
function toCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadianInput: number
) {
  const angleInRadians = angleInRadianInput - Math.PI / 2;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// input radian: makeArc(centerX, centerY, Radius for arc to draw, start point of arc (radian), end point of arc (radian))
function makeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const endAngleOriginal = endAngle;
  if (endAngleOriginal - startAngle === 2 * Math.PI) {
    endAngle = (359 * Math.PI) / 180;
  }

  const start = toCartesian(x, y, radius, endAngle);
  const end = toCartesian(x, y, radius, startAngle);

  const arcSweep = endAngle - startAngle <= Math.PI ? '0' : '1';

  if (endAngleOriginal - startAngle === 2 * Math.PI) {
    const dValue = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      arcSweep,
      0,
      end.x,
      end.y,
      'z',
    ].join(' ');

    return dValue;
  } else {
    const dValue = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      arcSweep,
      0,
      end.x,
      end.y,
    ].join(' ');

    return dValue;
  }
}

/**
 * this is a SVG donut marker icon
 */
export default function DonutMarker(props: DonutMarkerProps) {
  const {
    html: svgHTML,
    size,
    markerLabel,
    sliceTextOverrides,
  } = donutMarkerSVGIcon(props);

  // set icon as divIcon
  const SVGDonutIcon: any = L.divIcon({
    className: 'leaflet-canvas-icon', // may need to change this className but just leave it as it for now
    iconSize: new L.Point(size, size), // this will make icon to cover up SVG area!
    iconAnchor: new L.Point(size / 2, size / 2), // location of topleft corner: this is used for centering of the icon like transform/translate in CSS
    html: svgHTML, // divIcon HTML svg code generated above
  });

  // anim check duration exists or not
  const duration: number = props.duration ? props.duration : 300;

  const plotSize = 150;
  const marginSize = 0;

  const popupPlot = (
    <PiePlot
      data={{ slices: props.data }}
      donutOptions={{
        size: 0.5,
        text: markerLabel,
        fontSize: 18,
      }}
      containerStyles={{
        width: plotSize + 'px',
        height: plotSize + 'px',
      }}
      spacingOptions={{
        marginLeft: marginSize,
        marginRight: marginSize,
        marginTop: marginSize,
        marginBottom: marginSize,
      }}
      displayLegend={false}
      interactive={false}
      displayLibraryControls={false}
      textOptions={{
        displayPosition: 'inside',
        sliceTextOverrides,
      }}
      cumulative={props.cumulative}
    />
  );

  return (
    <BoundsDriftMarker
      id={props.id}
      position={props.position}
      bounds={props.bounds}
      icon={SVGDonutIcon}
      duration={duration}
      popupContent={{
        content: popupPlot,
        size: {
          width: plotSize,
          height: plotSize,
        },
      }}
      showPopup={props.showPopup}
      popupClass="donut-popup"
    />
  );
}

type DonutMarkerStandaloneProps = Omit<
  DonutMarkerProps,
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

export function DonutMarkerStandalone(props: DonutMarkerStandaloneProps) {
  const { html, size } = donutMarkerSVGIcon(props);
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

function donutMarkerSVGIcon(props: DonutMarkerStandaloneProps): {
  html: string;
  size: number;
  sliceTextOverrides: string[];
  markerLabel: string;
} {
  const scale = props.markerScale ?? MarkerScaleDefault;
  const size = 40 * scale;

  let svgHTML: string = '';

  //DKDK set drawing area
  svgHTML += '<svg width="' + size + '" height="' + size + '">'; //DKDK initiate svg marker icon

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

  //DKDK draw white circle
  svgHTML +=
    '<circle cx="' +
    size / 2 +
    '" cy="' +
    size / 2 +
    '" r="' +
    size / 2 +
    '" stroke="green" stroke-width="0" fill="white" />';

  //DKDK set start point of arc = 0
  let startValue = 0;
  let cumulativeSum = 0;
  const sliceTextOverrides: string[] = [];

  //DKDK create arcs for data
  props.data.forEach(function (el: PiePlotDatum) {
    //DKDK if fullPieValue = 0, do not draw arc
    if (fullPieValue > 0) {
      //DKDK compute the ratio of each data to the total number
      const thisValue = el.value - cumulativeSum; // subtracts nothing if not in cumulative mode, see below

      let arcValue: number = thisValue / fullPieValue;

      // for the magnified mouse-over pieplot
      sliceTextOverrides.push(arcValue >= 0.015 ? el.value.toString() : '');

      if (props.cumulative)
        // only sum up in cumulative mode
        cumulativeSum += thisValue;

      //DKDK draw arc: makeArc(centerX, centerY, Radius for arc, start point of arc (radian), end point of arc (radian))
      svgHTML +=
        '<path fill="none" stroke="' +
        (el.color ?? 'silver') +
        '" stroke-width="4" d="' +
        makeArc(
          size / 2,
          size / 2,
          size / 2 - 2,
          startValue,
          startValue + arcValue * 2 * Math.PI
        ) +
        '" />';
      //DKDK set next startValue to be previous arcValue
      startValue = startValue + arcValue * 2 * Math.PI;
    }
  });

  //DKDK adding total number text/label and centering it
  svgHTML +=
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1" fill="#505050" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="1em">' +
    sumLabel +
    '</text>';

  //DKDK check isAtomic: draw pushpin if true
  if (props.isAtomic) {
    let pushPinCode = '&#128392;';
    svgHTML +=
      '<text x="86%" y="14%" dominant-baseline="middle" text-anchor="middle" opacity="0.75" font-weight="bold" font-size="1.2em">' +
      pushPinCode +
      '</text>';
  }

  // DKDK closing svg tag
  svgHTML += '</svg>';
  return { html: svgHTML, size, sliceTextOverrides, markerLabel: sumLabel };
}
