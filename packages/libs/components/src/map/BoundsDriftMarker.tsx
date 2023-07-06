import { useMap, Popup } from 'react-leaflet';
import { useRef, useEffect } from 'react';
// use new ReactLeafletDriftMarker instead of DriftMarker
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import { MarkerProps, Bounds } from './Types';
import L, { LeafletMouseEvent, LatLngBounds } from 'leaflet';

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds;
  duration: number;
  // A class to add to the popup element
  popupClass?: string;
}

// Which direction the popup should come out from the marker
export type PopupOrientation = 'up' | 'down' | 'left' | 'right';

/*  after testing various approaches, it is found that sending mouse event props from story, like done in previous approach,
 *  seems to conflict with other mouse event like grey-box. Also, using function form of the top-marker event did not work either.
 *  The only way to work it out is to directly set function contents (e.g., e.target....) inside onMouseOver/Out
 *  For this reason, marker's props are adjusted without sending mouse event functions, but implemented here directly.
 */

export default function BoundsDriftMarker({
  position,
  bounds,
  icon,
  duration,
  showPopup,
  popupContent,
  popupClass,
}: BoundsDriftMarkerProps) {
  const map = useMap();
  const boundingBox = new LatLngBounds([
    [bounds.southWest.lat, bounds.southWest.lng],
    [bounds.northEast.lat, bounds.northEast.lng],
  ]);

  const boundsRectangle = L.rectangle(boundingBox, {
    color: 'gray',
    weight: 1,
  });
  useEffect(() => {
    /**
     * Prevents an edge case where the boundsRectangle persists if simultaneously a marker is hovered
     * and a user changes the viewport
     */
    return () => {
      map.removeLayer(boundsRectangle);
    };
  }, [map, boundsRectangle]);

  const markerRef = useRef<any>();
  const popupRef = useRef<any>();
  const popupOrientationRef = useRef<PopupOrientation>('up');

  // Update popupOrientationRef based on whether the marker is close to the map edge.
  // Does not actually change the popup, just the ref.

  // at react-leaflet-drift-marker, there is no leafletElement
  // rather, it seems to be exposed to upper level
  // i.e., current.leafletElement._icon -> current._icon
  const updatePopupOrientationRef = () => {
    if (popupContent && map) {
      // Figure out if we're close to the map edge
      const mapRect = map.getContainer().getBoundingClientRect();
      const markerRect = markerRef.current._icon.getBoundingClientRect();
      const markerCenterX = (markerRect.left + markerRect.right) / 2;

      if (markerRect.top - mapRect.top < popupContent.size.height) {
        popupOrientationRef.current = 'down';
      } else if (markerCenterX - mapRect.left < popupContent.size.width / 2) {
        popupOrientationRef.current = 'right';
      } else if (mapRect.right - markerCenterX < popupContent.size.width / 2) {
        popupOrientationRef.current = 'left';
      } else {
        popupOrientationRef.current = 'up';
      }
    }
  };

  // Change the popup's orientation
  const orientPopup = (orientation: PopupOrientation) => {
    if (popupRef.current) {
      const popupDOMNode = popupRef.current._container;

      if (popupDOMNode) {
        popupDOMNode.classList.remove(
          'popup-up',
          'popup-down',
          'popup-left',
          'popup-right'
        );

        const angle = {
          up: 0,
          right: 90,
          down: 180,
          left: -90,
        }[orientation];

        // Have to add rotate here rather than in CSS to preserve the existing
        // transform, which is variable
        if (!popupDOMNode.style.transform.includes('rotate'))
          popupDOMNode.style.transform += ` rotate(${angle}deg)`;

        popupDOMNode.classList.add('popup-' + orientation);
      }
    }
  };

  // Leaflet likes to change the popup's styling often, which throws off our
  // custom orientation styling. To fix this, we will watch for changes to the
  // popup's styling. If the transform property has no rotation, then our
  // changes have been wiped. In that case, redo them.
  const observer = new MutationObserver((mutationRecord) => {
    const popupDOMNode = mutationRecord[0].target as HTMLElement;
    if (!popupDOMNode.style.transform.includes('rotate')) {
      // When this observer callback is invoked, we end up getting to this
      // point multiple times in quick succession. This doesn't seem to cause a
      // performance issue currently, but it could be worth optimizing in the
      // future.
      orientPopup(popupOrientationRef.current);
    }
  });

  const handlePopupOpen = () => {
    // Orient the popup correctly
    updatePopupOrientationRef();
    orientPopup(popupOrientationRef.current);

    // Watch for changes to the popup's styling
    const popupDOMNode = popupRef.current._container as HTMLElement;
    observer.observe(popupDOMNode, { attributeFilter: ['style'] });
  };

  const handlePopupClose = () => {
    observer.disconnect();

    // Have to do this again because styling is changed again on close
    orientPopup(popupOrientationRef.current);
  };

  const popup = popupContent && (
    <Popup
      ref={popupRef}
      className={'plot-marker-popup' + (popupClass ? ` ${popupClass}` : '')}
      minWidth={popupContent.size.width}
      maxWidth={popupContent.size.width}
      maxHeight={popupContent.size.height}
      autoPan={false}
      closeButton={false}
      onOpen={() => handlePopupOpen()}
      onClose={() => handlePopupClose()}
    >
      {popupContent.content}
    </Popup>
  );

  const handleMouseOver = (e: LeafletMouseEvent) => {
    e.target._icon.classList.add('top-marker'); // marker on top
    map.addLayer(boundsRectangle);
    e.target.openPopup();
  };

  const handleMouseOut = (e: LeafletMouseEvent) => {
    e.target._icon.classList.remove('top-marker'); // remove marker on top
    map.removeLayer(boundsRectangle);
    e.target.closePopup();
  };

  const handleClick = (e: LeafletMouseEvent) => {
    // Sometimes clicking throws off the popup's orientation, so reorient it
    orientPopup(popupOrientationRef.current);
    // Default popup behavior is to open on marker click
    // Prevent by immediately closing it
    e.target.closePopup();
  };

  const handleDoubleClick = () => {
    if (map) {
      map.fitBounds(boundingBox);
    }
  };

  // DriftMarker misbehaves if icon=undefined is provided
  // is this the most elegant way?
  const optionalIconProp = icon ? { icon } : {};

  return (
    // <FixedDriftMarker
    <ReactLeafletDriftMarker
      ref={markerRef}
      duration={duration}
      position={position}
      // new way to handle mouse events
      eventHandlers={{
        click: (e: LeafletMouseEvent) => handleClick(e),
        mouseover: (e: LeafletMouseEvent) => handleMouseOver(e),
        mouseout: (e: LeafletMouseEvent) => handleMouseOut(e),
        dblclick: handleDoubleClick,
      }}
      {...optionalIconProp}
    >
      {showPopup && popup}
    </ReactLeafletDriftMarker>
  );
}
