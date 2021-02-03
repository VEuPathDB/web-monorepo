import {Rectangle, useLeaflet, Popup, MarkerProps as LeafletMarkerProps} from "react-leaflet";
import React, { useRef, useState } from "react";
import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds, ExtractProps } from './Types';
import { LeafletMouseEvent, LatLngBounds } from "leaflet";

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number,
}

export type PopupOrientation = 'up' | 'down' | 'left' | 'right';

// Wrapper component for DriftMarker to "fix" its Props type.
// We are adding the missing LeafletMarkerProps to the existing Props type of DriftMarker.
const FixedDriftMarker = DriftMarker as React.ComponentClass<ExtractProps<typeof DriftMarker> & LeafletMarkerProps>;

/*  DKDK after testing various approaches, it is found that sending mouse event props from story, like done in previous approach,
 *    seems to conflict with other mouse event like grey-box. Also, using function form of the top-marker event did not work either.
 *    The only way to work it out is to directly set function contents (e.g., e.target....) inside onMouseOver/Out
 *    For this reason, marker's props are adjusted without sending mouse event functions, but implemented here directly.
 */

export default function BoundsDriftMarker({position, bounds, icon, duration, showPopup, popupContent}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)
  const { map } = useLeaflet();
  const boundingBox = new LatLngBounds([
      [bounds.southWest.lat, bounds.southWest.lng], [bounds.northEast.lat, bounds.northEast.lng]])
  const markerRef = useRef<any>();
  const popupRef = useRef<any>();
  const popupOrientationRef = useRef<PopupOrientation>('up');

  const popup = popupContent && (<Popup
    ref={popupRef}
    className="plot-marker-popup"
    minWidth={popupContent.size.width}
    maxWidth={popupContent.size.width}
    maxHeight={popupContent.size.height}
    autoPan={false}
    closeButton={false}
  >
    {popupContent.content}
  </Popup>);

  const orientPopup = (orientation: PopupOrientation) => {
    const popupDOMNode = popupRef.current.leafletElement._container;
    popupDOMNode.classList.remove('popup-down', 'popup-left', 'popup-right');

    const angle = {
      'up': 0,
      'right': 90,
      'down': 180,
      'left': -90,
    }[orientation];

    // Have to add rotate here to preserve the existing transform, which varies
    popupDOMNode.style.transform += ` rotate(${angle}deg)`;
    popupDOMNode.classList.add('popup-' + orientation);
  }

  const handleMouseOver = (e: LeafletMouseEvent) => {
    e.target._icon.classList.add('top-marker');     //DKDK marker on top
    setDisplayBounds(true);  // Display bounds rectangle

    if (showPopup && popupContent) {
      e.target.openPopup();

      // Figure out if we're close to the viewport edge
      const markerRect = markerRef.current.leafletElement._icon.getBoundingClientRect();
      const markerCenterX = (markerRect.left + markerRect.right) / 2;

      if (markerRect.top < popupContent.size.height) {
        popupOrientationRef.current = 'down';
      } else if (markerCenterX < popupContent.size.width / 2) {
        popupOrientationRef.current = 'right';
      } else if (window.innerWidth - markerCenterX < popupContent.size.width / 2) {
        popupOrientationRef.current = 'left';
      } else {
        popupOrientationRef.current = 'up';
      }

      orientPopup(popupOrientationRef.current);
    }
  };

  const handleMouseOut = (e: LeafletMouseEvent) => {
    e.target._icon.classList.remove('top-marker');  //DKDK remove marker on top
    setDisplayBounds(false);  // Remove bounds rectangle

    if (showPopup && popupContent) {
      e.target.closePopup();
      // Have to do this again because styling is changed again on close
      orientPopup(popupOrientationRef.current);
    }
  }

  const handleClick = (e: LeafletMouseEvent) => {
    // Default popup behavior is to open on marker click
    // Prevent by immediately closing it
    e.target.closePopup();
  }

  const handleDoubleClick = () => {
    if (map) {
      map.fitBounds(boundingBox)
    }
  }

  // DriftMarker misbehaves if icon=undefined is provided
  // is this the most elegant way?
  const optionalIconProp = icon ? { icon } : { };

  return (<FixedDriftMarker
    ref={markerRef}
    duration={duration}
    position={position}
    onmouseover={(e: LeafletMouseEvent) => handleMouseOver(e)}
    onmouseout={(e: LeafletMouseEvent) => handleMouseOut(e)}
    onclick={(e: LeafletMouseEvent) => handleClick(e)}
    ondblclick={handleDoubleClick}
    {...optionalIconProp}
  >
    {
      displayBounds
        ? <Rectangle
            bounds={boundingBox}
            color={"gray"}
            weight={1}
          >
          </Rectangle>
        : null
    }
    {showPopup && popup}
  </FixedDriftMarker>)
}
