import {Rectangle, useLeaflet, Popup, Marker} from "react-leaflet";
import React, { useEffect, useRef, useState } from "react";
//DKDK block this
// import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds } from './Types';
import { LeafletMouseEvent, LatLngBounds, Marker as LeafletMarker } from "leaflet";
import ReactDOMServer from "react-dom/server";

//DKDK use require to avoid ts error (technically check...)
const { DriftMarker } = require('leaflet-drift-marker')

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number,
}

/*  DKDK after testing various approaches, it is found that sending mouse event props from story, like done in previous approach,
 *    seems to conflict with other mouse event like grey-box. Also, using function form of the top-marker event did not work either.
 *    The only way to work it out is to directly set function contents (e.g., e.target....) inside onMouseOver/Out
 *    For this reason, marker's props are adjusted without sending mouse event functions, but implemented here directly.
 */

export default function BoundsDriftMarker({position, bounds, icon, duration, showPopup, popupPlot}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)
  const { map } = useLeaflet();
  const boundingBox = new LatLngBounds([
      [bounds.southWest.lat, bounds.southWest.lng], [bounds.northEast.lat, bounds.northEast.lng]])
  const markerRef = useRef<Marker>();
  const popupRef = useRef<Popup>(null);
  const [popupStayOpenCount, setPopupStayOpenCount] = useState<number>(0);

  // Dave: try useCallback
  const incrementPopupStayOpenCount = () => {
    setPopupStayOpenCount(popupStayOpenCount + 1);
  }

  const decrementPopupStayOpenCount = () => {
    setPopupStayOpenCount(popupStayOpenCount - 1);
  }

  useEffect(() => {
    console.log(popupStayOpenCount);

    if (popupStayOpenCount <= 0) {
      markerRef.current.leafletElement.closePopup();
      // map.closePopup(popup.leafletElement);
    }
  }, [popupStayOpenCount]);

  const popup = (<Popup
    ref={popupRef}
    className="plot-marker-popup"
    minWidth={300}
    closeOnClick={false}
    // position={position}
    onMouseOver={incrementPopupStayOpenCount}
    onMouseOut={decrementPopupStayOpenCount}
  >
    {popupPlot}
  </Popup>);

  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.leafletElement.on({
        mouseover: incrementPopupStayOpenCount,
        mouseout: decrementPopupStayOpenCount,
      });
    }
  });

  // popupRef.current?.leafletElement.setLatLng(position);

  // const popup = L.popup({
  //   className: 'plot-marker-popup',
  //   minWidth: 300,
  //   closeOnClick: false,
  // }).set

  const handleMouseOver = (e: LeafletMouseEvent) => {
    e.target._icon.classList.add('top-marker');     //DKDK marker on top
    setDisplayBounds(true);

    if (showPopup && popup) {
      incrementPopupStayOpenCount();
      markerRef.current.leafletElement.openPopup();
      // map.openPopup(popup.leafletElement);
    }
  };

  const handleMouseOut = (e: LeafletMouseEvent) => {
    e.target._icon.classList.remove('top-marker');  //DKDK remove marker on top
    setDisplayBounds(false);

    if (showPopup && popup) {
      decrementPopupStayOpenCount();

      if (popupStayOpenCount <= 0) {
        markerRef.current.leafletElement.closePopup();
        // map.closePopup(popup.leafletElement);
      }
    }
  }

  // const handleMouseLeave = () => {
  //   console.log('mouse leave');
  //   if (showPopup && popup) {
  //     markerRef.current.leafletElement.closePopup();
  //     // map.closePopup(popup.leafletElement);
  //   }
  // }

  const handleClick = (e: LeafletMouseEvent) => {
    // if (popupRef.current.leafletElement.isOpen()) {
    //   markerRef.current.leafletElement.closePopup();
    // } else {
    //   markerRef.current.leafletElement.openPopup();
    // }
  }

  const handleDoubleClick = () => {
    if (map) {
      map.fitBounds(boundingBox)
    }
  }

  // DriftMarker misbehaves if icon=undefined is provided
  // is this the most elegant way?
  const optionalIconProp = icon ? { icon } : { };

  return (<DriftMarker
    ref={markerRef}
    duration={duration}
    position={position}
    onMouseOver={(e: LeafletMouseEvent) => handleMouseOver(e)} // Display bounds rectangle
    onMouseOut={(e: LeafletMouseEvent) => handleMouseOut(e)} // Remove bounds rectangle
    // onMouseLeave={() => handleMouseLeave()}
    {...optionalIconProp}
    onClick={(e: LeafletMouseEvent) => handleClick(e)}
    onDblClick={() => handleDoubleClick()} > 
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
  </DriftMarker>)
}
