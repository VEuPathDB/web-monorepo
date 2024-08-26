import { useRef, useEffect, useCallback } from 'react';
import L, { LeafletMouseEvent, LatLngBounds } from 'leaflet';
import { useMap, Popup } from 'react-leaflet';
// use new ReactLeafletDriftMarker instead of DriftMarker
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import { debounce } from 'lodash';

import { MarkerProps, Bounds } from './Types';

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds;
  duration: number;
  // selectedMarkers state
  selectedMarkers?: string[];
  // selectedMarkers setState
  setSelectedMarkers?: (selectedMarkers: string[] | undefined) => void;
}

/**
 * These adjustments account for discrepancies between actual rendered positions vs what getBoundingClient returns
 * NOTE: moreso determined by trial and error, nothing scientific
 */
const FINE_ADJUSTMENT = 5;
const OFFSET_ADJUSTMENT = 35;
// Default offset applied to popups. Not sure how/why the y-value is 7.
const DEFAULT_OFFSET = [0, 7];

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
  getVerticalPopupExtraOffset = () => [0, 0],
  getHorizontalPopupExtraOffset = () => [0, 0],
  zIndexOffset,
  selectedMarkers,
  setSelectedMarkers,
  ...props
}: BoundsDriftMarkerProps) {
  const map = useMap();

  const boundingBox = new LatLngBounds([
    [bounds.southWest.lat, bounds.southWest.lng],
    [bounds.northEast.lat, bounds.northEast.lng],
  ]);

  // This will get placed in the popupPane, so that
  // it is visible on top of the associated marker.
  // The `interactive` option is set to false, so
  // that it does not react to mouse events, which
  // allows the marker to be clicked, even if the
  // rectangle is above the marker.
  const boundsRectangle = L.rectangle(boundingBox, {
    color: 'gray',
    weight: 1,
    pane: 'popupPane',
    interactive: false,
  });

  useEffect(() => {
    /**
     * Prevents an edge case where the boundsRectangle persists if simultaneously a marker is hovered
     * and a user changes the viewport
     */
    return function cleanup() {
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
    if (popupContent && map && markerRef.current) {
      // Figure out if we're close to the map edge
      const mapRect = map.getContainer().getBoundingClientRect();
      const markerRect = markerRef.current._icon.getBoundingClientRect();
      const markerCenterX = (markerRect.left + markerRect.right) / 2;
      const grayBoundsRect = boundsRectangle
        .getElement()
        ?.getBoundingClientRect();
      /**
       * Now that we anchor to the "highest" element (the marker or the gray box), we want to use the "higher" element
       * when determining if the popup should orient up or down
       * To please TypeScript, we'll fallback to markerRect.top if grayBoundsRect doesn't exist (though it should exist)
       */
      const topOfMarkerOrGrayBox = grayBoundsRect
        ? markerRect.top < grayBoundsRect.top
          ? markerRect.top
          : grayBoundsRect.top
        : markerRect.top;

      if (
        topOfMarkerOrGrayBox - OFFSET_ADJUSTMENT - mapRect.top <
        popupContent.size.height
      ) {
        popupOrientationRef.current = 'down';
      } else if (
        markerCenterX - OFFSET_ADJUSTMENT / 2 - mapRect.left <
        popupContent.size.width / 2
      ) {
        popupOrientationRef.current = 'right';
      } else if (
        mapRect.right - OFFSET_ADJUSTMENT / 2 - markerCenterX <
        popupContent.size.width / 2
      ) {
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

  const updateAnchorPosition = (orientation: PopupOrientation) => {
    const grayBoundsRect = boundsRectangle
      .getElement()
      ?.getBoundingClientRect();
    /**
     * Early return if markerRef.current and popupRef.current are falsy. Include a check
     * on grayBoundsRect in the early return to please TypeScript.
     */
    if (!markerRef.current || !popupRef.current || !grayBoundsRect) return;

    const markerIconRect =
      markerRef.current._icon.firstChild.getBoundingClientRect() as DOMRect;
    const anchorRect =
      popupRef.current._tipContainer.getBoundingClientRect() as DOMRect;

    // The visible height of the anchor is actually half its reported height
    // (works out to be about 10px)
    const anchorHeight = anchorRect.height / 2;

    const markerIconCenter = [
      (markerIconRect.left + markerIconRect.right) / 2,
      (markerIconRect.top + markerIconRect.bottom) / 2,
    ] as [number, number];

    const verticalPopupExtraOffset =
      getVerticalPopupExtraOffset(markerIconRect);
    const horizontalPopupExtraOffset =
      getHorizontalPopupExtraOffset(markerIconRect);

    /**
     *
     * Within each conditional block, we will:
     *  1.  Check the position of the gray box vs the marker to determine which
     *      element the popup should be anchored to
     *  2.  Set the popupRef's offset accordingly (with some fuzzy calculations)
     *
     * Initial popup X and Y values were determined by observation when offsets
     * were set to 0.
     *
     * NOTE: When slightly adjusting the popup position in the future, prefer
     * to modify a single marker type's vertical/horizontalPopupExtraOffset
     * before modifying this code.
     *
     */
    // with the marker click event for selectedMarkers, popupRef is not used as it changes by click event
    if (orientation === 'down') {
      const xAdjustedOffset = FINE_ADJUSTMENT / 2 + verticalPopupExtraOffset[0];

      const initialPopupAnchorY = markerIconRect.top;
      const finalAnchorY =
        markerIconRect.bottom > grayBoundsRect.bottom
          ? markerIconRect.bottom
          : grayBoundsRect.bottom;
      const yBaseOffset = finalAnchorY - initialPopupAnchorY;
      const yAdjustedOffset =
        yBaseOffset + anchorHeight + verticalPopupExtraOffset[1];

      popupRef.current.options.offset = [xAdjustedOffset, yAdjustedOffset];
    } else if (orientation === 'right') {
      const initialPopupAnchorX = markerIconCenter[0];
      const finalAnchorX =
        markerIconRect.right > grayBoundsRect.right
          ? markerIconRect.right
          : grayBoundsRect.right;
      const xBaseOffset = finalAnchorX - initialPopupAnchorX;
      const xAdjustedOffset =
        xBaseOffset +
        anchorHeight / 2 +
        FINE_ADJUSTMENT +
        horizontalPopupExtraOffset[0];

      const initialPopupAnchorY = markerIconRect.top;
      const finalAnchorY = markerIconCenter[1];
      const yBaseOffset = finalAnchorY - initialPopupAnchorY;
      const yAdjustedOffset = yBaseOffset + horizontalPopupExtraOffset[1];

      popupRef.current.options.offset = [xAdjustedOffset, yAdjustedOffset];
    } else if (orientation === 'left') {
      const initialPopupAnchorX = markerIconCenter[0];
      const finalAnchorX =
        markerIconRect.left < grayBoundsRect.left
          ? markerIconRect.left
          : grayBoundsRect.left;
      const xBaseOffset = finalAnchorX - initialPopupAnchorX;
      const xAdjustedOffset =
        xBaseOffset - FINE_ADJUSTMENT + horizontalPopupExtraOffset[0];

      const initialPopupAnchorY = markerIconRect.top;
      const finalAnchorY = markerIconCenter[1];
      const yBaseOffset = finalAnchorY - initialPopupAnchorY;
      const yAdjustedOffset = yBaseOffset + horizontalPopupExtraOffset[1];

      popupRef.current.options.offset = [xAdjustedOffset, yAdjustedOffset];
    } else {
      // orientation === 'up'
      const xAdjustedOffset = FINE_ADJUSTMENT / 2 + verticalPopupExtraOffset[0];

      const anchorInitialY = markerIconRect.top;
      const anchorFinalY =
        markerIconRect.top < grayBoundsRect.top
          ? markerIconRect.top
          : grayBoundsRect.top;
      const yBaseOffset = anchorFinalY - anchorInitialY;
      const yAdjustedOffset =
        yBaseOffset - anchorHeight + verticalPopupExtraOffset[1];

      popupRef.current.options.offset = [xAdjustedOffset, yAdjustedOffset];
    }
  };

  const handlePopupOpen = () => {
    if (!popupRef.current) return;
    // Orient the popup correctly
    updatePopupOrientationRef();
    orientPopup(popupOrientationRef.current);

    // Do this after updatePopupOrientationRef and orientPopup so that the actual popupRef's orientation (not to be mistaken
    // with the popupOrientationRef) is updated by the time we use its getBoundingClientRect values
    updateAnchorPosition(popupOrientationRef.current);

    // Watch for changes to the popup's styling
    const popupDOMNode = popupRef.current._container as HTMLElement;
    observer.observe(popupDOMNode, { attributeFilter: ['style'] });
  };

  const handlePopupClose = () => {
    if (!popupRef.current) return;
    observer.disconnect();

    // Have to do this again because styling is changed again on close
    orientPopup(popupOrientationRef.current);

    // Set the popupRef's offsets back to the defaults so we use the same baseline position
    // to calculate the popup offset in updateAnchorPosition
    popupRef.current.options.offset = DEFAULT_OFFSET;
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
      onOpen={handlePopupOpen}
      onClose={handlePopupClose}
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

  // add click events for highlighting markers
  const handleClick = useCallback(
    (e: LeafletMouseEvent) => {
      // check the number of mouse click and enable function for single click only
      if (e.originalEvent.detail === 1) {
        if (setSelectedMarkers) {
          if (selectedMarkers?.find((id) => id === props.id)) {
            setSelectedMarkers(
              selectedMarkers.filter((id: string) => id !== props.id)
            );
          } else if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            // add to selection if CTRL or CMD key pressed
            setSelectedMarkers([...(selectedMarkers ?? []), props.id]);
          } else {
            // replace selection
            setSelectedMarkers([props.id]);
          }
        }

        // Sometimes clicking throws off the popup's orientation, so reorient it
        orientPopup(popupOrientationRef.current);
        // Default popup behavior is to open on marker click
        // Prevent by immediately closing it
        e.target.closePopup();
      }
    },
    [setSelectedMarkers, selectedMarkers, props.id]
  );

  const handleDoubleClick = (e: LeafletMouseEvent) => {
    // If any mofigier key is pressed, ignore double-click event
    // so users can quickly select multiple markers without
    // triggering a zoom
    if (map && !mouseEventHasModifierKey(e.originalEvent)) {
      map.fitBounds(boundingBox);
    }
  };

  // debounce single click to be prevented when double clicking marker
  const debounceSingleClick = debounce(handleClick, 300);

  // set this marker as highlighted
  if (icon && selectedMarkers?.find((id) => id === props.id))
    icon.options.className += ' highlight-marker';

  // set this marker's popup as highlighted
  if (popupContent && popupRef.current && popupRef.current._container) {
    if (selectedMarkers?.find((id) => id === props.id)) {
      popupRef.current._container.classList.add('marker-popup-highlight');
    } else {
      popupRef.current._container.classList.remove('marker-popup-highlight');
    }
  }

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
        // debounce single click to be prevented when double clicking marker
        click: debounceSingleClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
        dblclick: handleDoubleClick,
      }}
      zIndexOffset={zIndexOffset}
      {...optionalIconProp}
    >
      {showPopup && popup}
    </ReactLeafletDriftMarker>
  );
}

export function mouseEventHasModifierKey(event: MouseEvent) {
  return event.ctrlKey || event.altKey || event.metaKey || event.shiftKey;
}
