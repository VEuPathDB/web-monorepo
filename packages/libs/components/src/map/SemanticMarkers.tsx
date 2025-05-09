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
import { debounce, isEqual } from 'lodash';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';
import AreaSelect from './AreaSelect';

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
  /* selectedMarkers state **/
  selectedMarkers?: string[];
  /* selectedMarkers setState **/
  setSelectedMarkers?: (selectedMarkers: string[] | undefined) => void;
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
  selectedMarkers,
  setSelectedMarkers,
}: SemanticMarkersProps) {
  // react-leaflet v3
  const map = useMap();

  const { enqueueSnackbar } = useSnackbar();

  const [prevRecenteredMarkers, setPrevRecenteredMarkers] =
    useState<ReactElement<BoundsDriftMarkerProps>[]>(markers);

  const [consolidatedMarkers, setConsolidatedMarkers] =
    useState<ReactElement<BoundsDriftMarkerProps>[]>(markers);

  useEffect(() => {
    let timeoutVariable: number | undefined;
    // debounce needed to avoid cyclic in/out zooming behaviour? (still?)
    // 2023-11: it does seem to be needed for zoom-in animation to work.
    const debouncedUpdateMarkerPositions = debounce(
      updateMarkerPositions,
      animation ? animation.duration : 0
    );
    // call it at least once at the beginning of the life cycle
    debouncedUpdateMarkerPositions();

    // attach to leaflet events handler
    map.on('resize moveend dragend zoomend', debouncedUpdateMarkerPositions); // resize is there hopefully when we have full screen mode

    return () => {
      // detach from leaflet events handler
      map.off('resize moveend dragend zoomend', debouncedUpdateMarkerPositions);
      debouncedUpdateMarkerPositions.cancel();
      clearTimeout(timeoutVariable);
    };

    // function definitions

    // handle repositioning of markers into the user's viewport if they have panned
    // east or west into "another world" (longitudes >180 or <-180), and zoom-related animation
    function updateMarkerPositions() {
      const bounds = boundsToGeoBBox(map.getBounds());
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

              // Is the new position inside the "viewport"?
              // (strictly this is the un-greyed-out region in the middle when zoomed well out)
              const inBounds =
                lng <= bounds.northEast.lng &&
                lng >= bounds.southWest.lng &&
                lat <= bounds.northEast.lat &&
                lat >= bounds.southWest.lat;

              return recentered
                ? cloneElement(marker, {
                    position: { lat, lng },
                    bounds: {
                      southWest: { lat: ltMin, lng: lnMin },
                      northEast: { lat: ltMax, lng: lnMax },
                    },
                    // to prevent "fly-bys" (see #628) disable animation for out-of-bounds markers
                    ...(inBounds ? {} : { duration: -1 }),
                  })
                : marker;
            })
          : markers;

      // now handle animation
      if (
        recenteredMarkers.length > 0 &&
        prevRecenteredMarkers.length > 0 &&
        animation
      ) {
        // get the position-modified markers from `animationFunction`
        // see geohash.tsx for example
        const { markers: oldAndNewRepositionedMarkers } =
          animation.animationFunction({
            prevMarkers: prevRecenteredMarkers,
            markers: recenteredMarkers,
          });
        // set them as current
        // any marker that already existed will move to the modified position
        if (
          !isEqual(
            oldAndNewRepositionedMarkers.map(({ props }) => props),
            consolidatedMarkers.map(({ props }) => props)
          )
        )
          setConsolidatedMarkers(oldAndNewRepositionedMarkers);

        // we used to set a timer to remove the old markers when zooming out
        // but now we just let the next render cycle do it.
      } else {
        /** First render of markers **/
        if (
          !isEqual(
            recenteredMarkers.map(({ props }) => props),
            consolidatedMarkers.map(({ props }) => props)
          )
        )
          setConsolidatedMarkers(recenteredMarkers);
      }

      // To prevent infinite loops, especially when in "other worlds",
      // update previous markers unless they are deep-equals.
      // Only check the props - hopefully more efficient!
      // If there are any function props (there aren't right now) these
      // will be compared with referential-equals.
      if (
        !isEqual(
          recenteredMarkers.map(({ props }) => props),
          prevRecenteredMarkers.map(({ props }) => props)
        )
      )
        setPrevRecenteredMarkers(recenteredMarkers);
    }
  }, [
    animation,
    map,
    markers,
    prevRecenteredMarkers,
    recenterMarkers,
    consolidatedMarkers,
  ]);

  // remove any selectedMarkers that no longer exist in the current markers
  useEffect(() => {
    if (setSelectedMarkers && selectedMarkers) {
      const prunedSelectedMarkers = selectedMarkers.filter((id) =>
        consolidatedMarkers.find(({ props }) => id === props.id)
      );

      if (prunedSelectedMarkers.length < selectedMarkers.length) {
        const consolidatedMarkersElementLength =
          consolidatedMarkers.length === 0
            ? 0
            : consolidatedMarkers[0].props.id.length;

        const selectedMarkersElementLength =
          selectedMarkers.length === 0 ? 0 : selectedMarkers[0].length;

        const message =
          consolidatedMarkersElementLength !== selectedMarkersElementLength
            ? consolidatedMarkersElementLength === 0
              ? 'Marker selection has been cancelled because there are no visible markers in the current view'
              : 'Marker selection has been cancelled because aggregation level has changed due to zooming'
            : 'Selected markers that are no longer visible have been deselected';

        enqueueSnackbar(message, {
          variant: 'info',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });

        setSelectedMarkers(prunedSelectedMarkers);
      }
    }
  }, [
    consolidatedMarkers,
    selectedMarkers,
    setSelectedMarkers,
    enqueueSnackbar,
  ]);

  // add the selectedMarkers props and callback
  // (and the scheduled-for-removal showPopup prop)
  const refinedMarkers = useMemo(
    () =>
      consolidatedMarkers.map((marker) =>
        cloneElement(marker, {
          showPopup: true,
          selectedMarkers,
          setSelectedMarkers,
        })
      ),
    [consolidatedMarkers, selectedMarkers, setSelectedMarkers]
  );

  // this should use the unadulterated markers (which are always in the "main world")
  useFlyToMarkers({ markers, flyToMarkers, flyToMarkersDelay });

  // rectangle marker selection
  const onAreaSelected = useCallback(
    (boxCoord: Bounds | undefined) => {
      if (boxCoord != null && setSelectedMarkers != null) {
        // find markers within area selection
        const boxCoordMarkers = consolidatedMarkers
          ?.filter((marker) => {
            // check if the center of a marker is within selected area
            return (
              marker.props.position.lat >= boxCoord.southWest.lat &&
              marker.props.position.lat <= boxCoord.northEast.lat &&
              marker.props.position.lng >= boxCoord.southWest.lng &&
              marker.props.position.lng <= boxCoord.northEast.lng
            );
          })
          .map(({ props: { id } }) => id);

        // combine, de-duplicate, and update selected marker IDs
        const combinedMarkers = [
          ...(selectedMarkers ?? []),
          ...(boxCoordMarkers ?? []),
        ];
        setSelectedMarkers(Array.from(new Set(combinedMarkers)));
      }
    },
    [consolidatedMarkers, selectedMarkers, setSelectedMarkers]
  );

  return (
    <>
      <AreaSelect onAreaSelected={onAreaSelected} />
      {refinedMarkers}
    </>
  );
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
