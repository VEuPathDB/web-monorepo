import L from 'leaflet';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from './BoundsDriftMarker';

import { ContainerStylesAddon } from '../types/plots';

export interface BubbleMarkerProps extends BoundsDriftMarkerProps {
  data: {
    /* The size value that is displayed in the popup as Count: */
    value: number;
    /* The diameter of the marker */
    diameter: number;
    /* The color value shown in the popup as `colorLabel:` */
    colorValue?: string;
    /* Label shown next to the color value in the popup */
    colorLabel?: string;
    /* The color to fill the bubble marker with */
    color?: string;
  };
  // isAtomic: add a special thumbtack icon if this is true
  isAtomic?: boolean;
  onClick?: (event: L.LeafletMouseEvent) => void | undefined;
}

/**
 * this is a SVG bubble marker icon
 */
export default function BubbleMarker(props: BubbleMarkerProps) {
  const selectedMarkers = props.selectedMarkers;
  const setSelectedMarkers = props.setSelectedMarkers;

  const { html: svgHTML, diameter: size } = bubbleMarkerSVGIcon(props);

  // set icon as divIcon
  const SVGBubbleIcon = L.divIcon({
    className: 'leaflet-canvas-icon marker-id-' + props.id + ' bubble-marker',
    iconSize: new L.Point(size, size), // this will make icon to cover up SVG area!
    iconAnchor: new L.Point(size / 2, size / 2), // location of topleft corner: this is used for centering of the icon like transform/translate in CSS
    html: svgHTML, // divIcon HTML svg code generated above
  });

  // anim check duration exists or not
  const duration: number = props.duration ? props.duration : 300;
  const popupSize = 120;

  const popupContent = (
    <div style={{ position: 'relative', height: popupSize, width: popupSize }}>
      <div
        style={{
          fontSize: 16,
          lineHeight: '150%',
          height: popupSize / 2,
          width: popupSize,
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <div>
          <b style={{ marginRight: '0.15rem' }}>Count</b> {props.data.value}
        </div>
        {props.data.colorValue && (
          <div style={{ marginTop: '1rem' }}>
            <b style={{ marginRight: '0.15rem' }}>
              {props.data.colorLabel ?? 'Value'}
            </b>{' '}
            {props.data.colorValue}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BoundsDriftMarker
      id={props.id}
      position={props.position}
      bounds={props.bounds}
      icon={SVGBubbleIcon as L.Icon}
      duration={duration}
      // This makes sure smaller markers are on top of larger ones.
      // The factor of 1000 ensures that the offset dominates over
      // the default zIndex, which itself varies.
      zIndexOffset={-props.data.value * 1000}
      popupContent={{
        content: popupContent,
        size: {
          width: popupSize,
          height: popupSize,
        },
      }}
      getVerticalPopupExtraOffset={(markerRect) => [
        0,
        20 - markerRect.height / 2,
      ]}
      getHorizontalPopupExtraOffset={(markerRect) => [
        -3,
        21 - markerRect.height / 2,
      ]}
      showPopup={props.showPopup}
      // pass selectedMarkers state and setState
      selectedMarkers={selectedMarkers}
      setSelectedMarkers={setSelectedMarkers}
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
  const diameter = props.data.diameter;
  const radius = diameter / 2;
  // set outer white circle size to describe white boundary
  const outlineWidth = 2;
  const outlineRadius = radius + outlineWidth;

  let svgHTML: string = '';

  // set drawing area
  svgHTML +=
    '<svg width="' +
    outlineRadius * 2 +
    '" height="' +
    outlineRadius * 2 +
    '">'; // initiate svg marker icon

  // for display, convert large value with k (e.g., 12345 -> 12k): return original value if less than a criterion
  // const sumLabel = props.markerLabel ?? String(fullPieValue);

  // draw a larger white-filled circle
  svgHTML +=
    '<circle cx="' +
    outlineRadius +
    '" cy="' +
    outlineRadius +
    '" r="' +
    outlineRadius +
    '" stroke="green" stroke-width="0" fill="white" />';

  // create bubble
  svgHTML +=
    '<circle cx="' +
    outlineRadius +
    '" cy="' +
    outlineRadius +
    '" r="' +
    radius +
    '" stroke="white" stroke-width="0" fill="' +
    (props.data.color ?? '') +
    '" />';

  //TODO: do we need to show total number for bubble marker?
  // adding total number text/label and centering it
  // svgHTML +=
  //   '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="1em">' +
  //   props.data.value +
  //   '</text>';

  // check isAtomic: draw pushpin if true
  if (props.isAtomic) {
    let pushPinCode = '&#128392;';
    svgHTML +=
      '<text x="86%" y="14%" dominant-baseline="middle" text-anchor="middle" opacity="0.75" font-weight="bold" font-size="1.2em">' +
      pushPinCode +
      '</text>';
  }

  svgHTML += '</svg>';

  return { html: svgHTML, diameter: diameter };
}
