import {
  ReactElement,
  useEffect,
  useState,
  cloneElement,
  useMemo,
  useCallback,
} from 'react';
import { AnimationFunction, Bounds } from './Types';
import { BoundsDriftMarkerProps } from './BoundsDriftMarker';
import { useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { debounce } from 'lodash';

export interface SemanticMarkersProps {
  markers: Array<ReactElement<BoundsDriftMarkerProps>>;
  recenterMarkers?: boolean;
  animation: {
    method: string;
    duration: number;
    animationFunction: AnimationFunction<BoundsDriftMarkerProps>;
  } | null;
  /** Whether to zoom and pan map to center on markers */
  flyToMarkers?: boolean;
  /** How long (in ms) after rendering to wait before flying to markers */
  flyToMarkersDelay?: number;
}

/**
 * Renders the semantic markers layer
 *
 *
 * @param props
 */
export default function SemanticMarkers({
  markers,
  animation,
  recenterMarkers = true,
  flyToMarkers,
  flyToMarkersDelay,
}: SemanticMarkersProps) {
  // react-leaflet v3
  const map = useMap();

  const [prevMarkers, setPrevMarkers] =
    useState<ReactElement<BoundsDriftMarkerProps>[]>(markers);

  const [consolidatedMarkers, setConsolidatedMarkers] =
    useState<ReactElement<BoundsDriftMarkerProps>[]>(markers);

  useEffect(() => {
    let timeoutVariable: number | undefined;
    // debounce needed to avoid cyclic in/out zooming behaviour
    const debouncedUpdateBounds = debounce(updateBounds, 1000);
    // call it at least once at the beginning of the life cycle
    debouncedUpdateBounds();

    // attach to leaflet events handler
    map.on('resize moveend dragend zoomend', debouncedUpdateBounds); // resize is there hopefully when we have full screen mode

    return () => {
      // detach from leaflet events handler
      map.off('resize moveend dragend zoomend', debouncedUpdateBounds);
      debouncedUpdateBounds.cancel();
      clearTimeout(timeoutVariable);
    };

    // function definitions

    function updateBounds() {
      const bounds = boundsToGeoBBox(map.getBounds());
      // handle recentering of markers (around +180/-180 longitude) and animation
      const recenteredMarkers =
        recenterMarkers && bounds
          ? markers.map((marker) => {
              let { lat, lng } = marker.props.position;
              let {
                southWest: { lat: ltMin, lng: lnMin },
                northEast: { lat: ltMax, lng: lnMax },
              } = marker.props.bounds;
              let recentered: boolean = false;
              while (lng > bounds.northEast.lng) {
                lng -= 360;
                lnMax -= 360;
                lnMin -= 360;
                recentered = true;
              }
              while (lng < bounds.southWest.lng) {
                lng += 360;
                lnMax += 360;
                lnMin += 360;
                recentered = true;
              }
              return recentered
                ? cloneElement(marker, {
                    position: { lat, lng },
                    bounds: {
                      southWest: { lat: ltMin, lng: lnMin },
                      northEast: { lat: ltMax, lng: lnMax },
                    },
                  })
                : marker;
            })
          : markers;

      const didRecenterMarkers = !isShallowEqual(markers, recenteredMarkers);

      // now handle animation
      // but don't animate if we moved markers by 360 deg. longitude
      // because the DriftMarker or Leaflet.Marker.SlideTo code seems to
      // send everything back to the 'main' world.
      if (recenteredMarkers.length > 0 && prevMarkers.length > 0 && animation) {
        const animationValues = animation.animationFunction({
          prevMarkers,
          markers: recenteredMarkers,
        });
        setConsolidatedMarkers(animationValues.markers);
        timeoutVariable = enqueueZoom(
          animationValues.zoomType,
          recenteredMarkers
        );
      } else {
        /** First render of markers **/
        setConsolidatedMarkers(recenteredMarkers);
      }

      // Update previous markers
      setPrevMarkers(recenteredMarkers);
    }

    function enqueueZoom(
      zoomType: string | null,
      nextMarkers: ReactElement<BoundsDriftMarkerProps>[]
    ) {
      /** If we are zooming in then reset the marker elements. When initially rendered
       * the new markers will start at the matching existing marker's location and here we will
       * reset marker elements so they will animated to their final position
       **/
      if (zoomType === 'in') {
        setConsolidatedMarkers(nextMarkers);
      } else if (zoomType === 'out') {
        /** If we are zooming out then remove the old markers after they finish animating. **/
        return window.setTimeout(
          () => {
            setConsolidatedMarkers(nextMarkers);
          },
          animation ? animation.duration : 0
        );
      }
    }
  }, [animation, map, markers, prevMarkers, recenterMarkers]);

  const refinedMarkers = useMemo(
    () =>
      consolidatedMarkers.map((marker) =>
        cloneElement(marker, { showPopup: true })
      ),
    [consolidatedMarkers]
  );

  // this should use the unadulterated markers (which are always in the "main world")
  useFlyToMarkers({ markers, flyToMarkers, flyToMarkersDelay });

  return <>{refinedMarkers}</>;
}

function boundsToGeoBBox(bounds: LatLngBounds): Bounds {
  var south = bounds.getSouth();
  if (south < -90) {
    south = -90;
  }
  var north = bounds.getNorth();
  if (north > 90) {
    north = 90;
  }
  var east = bounds.getEast();
  var west = bounds.getWest();

  if (east - west > 360) {
    const center = (east + west) / 2;
    west = center - 180;
    east = center + 180;
  }

  return {
    southWest: { lat: south, lng: west },
    northEast: { lat: north, lng: east },
  };
}

// for flyTo
interface PerformFlyToMarkersProps {
  /* markers */
  markers: ReactElement<BoundsDriftMarkerProps>[];
  /** Whether to zoom and pan map to center on markers */
  flyToMarkers?: boolean;
  /** How long (in ms) after rendering to wait before flying to markers */
  flyToMarkersDelay?: number;
}

// component to implement flyTo functionality
function useFlyToMarkers(props: PerformFlyToMarkersProps) {
  const { markers, flyToMarkers, flyToMarkersDelay } = props;

  // instead of using useRef() to the map in v2, useMap() should be used instead in v3
  const map = useMap();

  const markersBounds = useMemo(() => {
    return computeMarkersBounds(markers);
  }, [markers]);

  const performFlyToMarkers = useCallback(() => {
    if (markersBounds) {
      const boundingBox = computeBoundingBox(markersBounds);
      if (boundingBox) map.fitBounds(boundingBox);
    }
  }, [markersBounds, map]);

  useEffect(() => {
    const asyncEffect = async () => {
      if (flyToMarkersDelay)
        await new Promise((resolve) => setTimeout(resolve, flyToMarkersDelay));
      performFlyToMarkers();
    };

    if (flyToMarkers && markers.length > 0) asyncEffect();
  }, [markers, flyToMarkers, flyToMarkersDelay, performFlyToMarkers]);

  return null;
}

// compute bounding box
function computeBoundingBox(markersBounds: Bounds | null) {
  if (markersBounds) {
    const ne = markersBounds.northEast;
    const sw = markersBounds.southWest;

    const bufferFactor = 0.1;
    const latBuffer = (ne.lat - sw.lat) * bufferFactor;
    const lngBuffer = (ne.lng - sw.lng) * bufferFactor;

    const boundingBox = new LatLngBounds([
      [sw.lat - latBuffer, sw.lng - lngBuffer],
      [ne.lat + latBuffer, ne.lng + lngBuffer],
    ]);

    return boundingBox;
  } else {
    return undefined;
  }
}

// compute markers bounds
function computeMarkersBounds(markers: ReactElement<BoundsDriftMarkerProps>[]) {
  if (markers) {
    let [minLat, maxLat, minLng, maxLng] = [90, -90, 180, -180];

    for (const marker of markers) {
      const bounds = marker.props.bounds;
      const ne = bounds.northEast;
      const sw = bounds.southWest;

      if (ne.lat > maxLat) maxLat = ne.lat;
      if (ne.lat < minLat) minLat = ne.lat;

      if (ne.lng > maxLng) maxLng = ne.lng;
      if (ne.lng < minLng) minLng = ne.lng;

      if (sw.lat > maxLat) maxLat = sw.lat;
      if (sw.lat < minLat) minLat = sw.lat;

      if (sw.lng > maxLng) maxLng = sw.lng;
      if (sw.lng < minLng) minLng = sw.lng;
    }

    return {
      southWest: { lat: minLat, lng: minLng },
      northEast: { lat: maxLat, lng: maxLng },
    };
  } else {
    return null;
  }
}

function isShallowEqual<T>(array1: T[], array2: T[]) {
  if (array1.length !== array2.length) return false;

  for (let index = 0; index < array1.length; index++) {
    if (array1[index] !== array2[index]) return false;
  }
  return true;
}
