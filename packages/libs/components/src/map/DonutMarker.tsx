import React from 'react';
import L from 'leaflet';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from './BoundsDriftMarker';

import PiePlot from '../plots/PiePlot';
import {
  MarkerScaleAddon,
  MarkerScaleDefault,
  PiePlotData,
  PiePlotDatum,
} from '../types/plots';

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
  const fullStat: PiePlotData = {
    slices: props.data.map((datum) => {
      return {
        color: datum.color ? datum.color : 'silver',
        label: datum.label,
        value: datum.value,
      };
    }),
  };

  // construct histogram marker icon
  const scale = props.markerScale ?? MarkerScaleDefault;
  const size = 40 * scale;
  let svgHTML: string = ''; // divIcon HTML contents

  // set drawing area
  svgHTML += '<svg width="' + size + '" height="' + size + '">';

  // summation of fullStat.value per marker icon
  const sumValues: number = fullStat.slices
    .map((o) => o.value)
    .reduce((a, c) => {
      return a + c;
    });

  // for display, convert large value with k (e.g., 12345 -> 12k): return original value if less than a criterion
  const sumLabel = props.markerLabel ?? String(sumValues);

  // draw white circle
  svgHTML +=
    '<circle cx="' +
    size / 2 +
    '" cy="' +
    size / 2 +
    '" r="' +
    size / 2 +
    '" stroke="green" stroke-width="0" fill="white" />';

  // set start point of arc = 0
  let startValue: number = 0;
  // create arcs for data
  fullStat.slices.map((el: PiePlotDatum) => {
    // if sumValues = 0, do not draw arc
    if (sumValues > 0) {
      // compute the ratio of each data to the total number
      const arcValue: number = el.value / sumValues;
      // draw arc: makeArc(centerX, centerY, Radius for arc, start point of arc (radian), end point of arc (radian))
      svgHTML +=
        '<path fill="none" stroke="' +
        el.color +
        '" stroke-width="4" d="' +
        makeArc(
          size / 2,
          size / 2,
          size / 2 - 2,
          startValue,
          startValue + arcValue * 2 * Math.PI
        ) +
        '" />';
      // set next startValue to be previous arcValue
      startValue = startValue + arcValue * 2 * Math.PI;
    }
  });

  // adding total number text/label and centering it
  svgHTML +=
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1" fill="#505050" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="1em">' +
    sumLabel +
    '</text>';

  // check isAtomic: draw pushpin if true
  if (props.isAtomic) {
    const pushPinCode = '&#128392;'; // this does not work for me
    // const pushPinCode = '&#128204;';  // red push pin works. idk why but black-color based one does not work here
    svgHTML +=
      '<text x="86%" y="14%" dominant-baseline="middle" text-anchor="middle" opacity="0.75" font-weight="bold" font-color="black" font-size="1.2em">' +
      pushPinCode +
      '</text>';
  }

  //  closing svg tag
  svgHTML += '</svg>';

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
      data={fullStat}
      donutOptions={{
        size: 0.5,
        text: String(sumLabel),
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
        sliceTextOverrides: fullStat.slices.map((datum) =>
          datum.value / sumValues >= 0.015 ? datum.value.toString() : ''
        ),
      }}
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
