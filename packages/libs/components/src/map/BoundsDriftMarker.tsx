import {Rectangle, useLeaflet, Popup, MarkerProps as LeafletMarkerProps} from "react-leaflet";
import React, { useRef, useState } from "react";
import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds, ExtractProps } from './Types';
import { LeafletMouseEvent, LatLngBounds } from "leaflet";

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number,
}

// Wrapper component for DriftMarker to "fix" its Props type.
// We are adding the missing LeafletMarkerProps to the existing Props type of DriftMarker.
const FixedDriftMarker = DriftMarker as React.ComponentClass<ExtractProps<typeof DriftMarker> & LeafletMarkerProps>;

/*  DKDK after testing various approaches, it is found that sending mouse event props from story, like done in previous approach,
 *    seems to conflict with other mouse event like grey-box. Also, using function form of the top-marker event did not work either.
 *    The only way to work it out is to directly set function contents (e.g., e.target....) inside onMouseOver/Out
 *    For this reason, marker's props are adjusted without sending mouse event functions, but implemented here directly.
 */

export default function BoundsDriftMarker({position, bounds, icon, duration, showPopup, popupPlot, popupContentSize}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)
  const { map } = useLeaflet();
  const boundingBox = new LatLngBounds([
      [bounds.southWest.lat, bounds.southWest.lng], [bounds.northEast.lat, bounds.northEast.lng]])
  const markerRef = useRef<any>();
  const popupRef = useRef<any>();
  const popupOrientationRef = useRef('up');

  const popup = (<Popup
    ref={popupRef}
    className="plot-marker-popup"
    minWidth={popupContentSize?.width}
    maxWidth={popupContentSize?.width}
    maxHeight={popupContentSize?.height}
    autoPan={false}
    closeButton={false}
  >
    {popupPlot}
  </Popup>);

  const setPopupOrientation = (orientation: string) => {
    const popupDOMNode = popupRef.current.leafletElement._container;
    popupDOMNode.classList.remove('popup-down', 'popup-left', 'popup-right');

    if (orientation === 'right') {
      popupDOMNode.classList.add('popup-right');
      popupDOMNode.style.transform += ' rotate(90deg)';
    } else if (orientation === 'down') {
      popupDOMNode.classList.add('popup-down');
      popupDOMNode.style.transform += ' rotate(180deg)';
    } else if (orientation === 'left') {
      popupDOMNode.classList.add('popup-left');
      popupDOMNode.style.transform += ' rotate(-90deg)';
    }
  }

  const handleMouseOver = (e: LeafletMouseEvent) => {
    e.target._icon.classList.add('top-marker');     //DKDK marker on top
    setDisplayBounds(true);  // Display bounds rectangle

    if (showPopup && popupContentSize) {
      e.target.openPopup();

      const markerRect = markerRef.current.leafletElement._icon.getBoundingClientRect();
      const markerCenter = {
        x: (markerRect.left + markerRect.right) / 2,
        y: (markerRect.top + markerRect.bottom) / 2,
      }

      if (markerCenter.x < popupContentSize.width / 2) {
        popupOrientationRef.current = 'right';
      } else if (markerRect.top < popupContentSize.height) {
        popupOrientationRef.current = 'down';
      } else if (window.innerWidth - markerCenter.x < popupContentSize.width / 2) {
        popupOrientationRef.current = 'left';
      } else {
        popupOrientationRef.current = 'up';
      }

      setPopupOrientation(popupOrientationRef.current);
    }
  };

  const handleMouseOut = (e: LeafletMouseEvent) => {
    e.target._icon.classList.remove('top-marker');  //DKDK remove marker on top
    setDisplayBounds(false);  // Remove bounds rectangle

    if (showPopup && popupContentSize) {
      e.target.closePopup();
      setPopupOrientation(popupOrientationRef.current);
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
