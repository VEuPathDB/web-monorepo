import { ReactElement, useEffect, useState, cloneElement } from 'react';
import {
  MarkerProps,
  BoundsViewport,
  AnimationFunction,
  Bounds,
} from './Types';
import { BoundsDriftMarkerProps } from './BoundsDriftMarker';
import { useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { debounce } from 'lodash';

interface SemanticMarkersProps {
  onBoundsChanged: (bvp: BoundsViewport) => void;
  markers: Array<ReactElement<BoundsDriftMarkerProps>>;
  recenterMarkers?: boolean;
  animation: {
    method: string;
    duration: number;
    animationFunction: AnimationFunction;
  } | null;
}

/**
 * Renders the semantic markers layer
 *
 *
 * @param props
 */
export default function SemanticMarkers({
  onBoundsChanged,
  markers,
  animation,
  recenterMarkers = true,
}: SemanticMarkersProps) {
  // react-leaflet v3
  const map = useMap();

  const [prevMarkers, setPrevMarkers] =
    useState<ReactElement<BoundsDriftMarkerProps>[]>(markers);
  // local bounds state needed for recentreing markers
  const [bounds, setBounds] = useState<Bounds>();

  const [consolidatedMarkers, setConsolidatedMarkers] = useState<
    ReactElement<MarkerProps>[]
  >([]);
  const [zoomType, setZoomType] = useState<string | null>(null);

  // call the prop callback to communicate bounds and zoomLevel to outside world
  useEffect(() => {
    if (map == null) return;

    function updateBounds() {
      if (map != null) {
        const bounds = boundsToGeoBBox(map.getBounds());
        setBounds(bounds);
        const zoomLevel = map.getZoom();
        onBoundsChanged({
          bounds: constrainLongitudeToMainWorld(bounds),
          zoomLevel,
        });
      }
    }

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
    };
  }, [map, onBoundsChanged]);

  // handle recentering of markers (around +180/-180 longitude) and animation
  useEffect(() => {
    let recenteredMarkers = false;
    if (recenterMarkers && bounds) {
      markers = markers.map((marker) => {
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
        recenteredMarkers = recenteredMarkers || recentered;
        return recentered
          ? cloneElement(marker, {
              position: { lat, lng },
              bounds: {
                southWest: { lat: ltMin, lng: lnMin },
                northEast: { lat: ltMax, lng: lnMax },
              },
            })
          : marker;
      });
    }

    // now handle animation
    // but don't animate if we moved markers by 360 deg. longitude
    // because the DriftMarker or Leaflet.Marker.SlideTo code seems to
    // send everything back to the 'main' world.
    if (
      markers.length > 0 &&
      prevMarkers.length > 0 &&
      animation &&
      !recenteredMarkers
    ) {
      const animationValues = animation.animationFunction({
        prevMarkers,
        markers,
      });
      setZoomType(animationValues.zoomType);
      setConsolidatedMarkers(animationValues.markers);
    } else {
      /** First render of markers **/
      setConsolidatedMarkers([...markers]);
    }

    // Update previous markers with the original markers array
    setPrevMarkers(markers);
  }, [markers, bounds]);

  useEffect(() => {
    /** If we are zooming in then reset the marker elements. When initially rendered
     * the new markers will start at the matching existing marker's location and here we will
     * reset marker elements so they will animated to their final position
     **/
    let timeoutVariable: NodeJS.Timeout;

    if (zoomType == 'in') {
      setConsolidatedMarkers([...markers]);
    } else if (zoomType == 'out') {
      /** If we are zooming out then remove the old markers after they finish animating. **/
      timeoutVariable = setTimeout(
        () => {
          setConsolidatedMarkers([...markers]);
        },
        animation ? animation.duration : 0
      );
    }

    return () => clearTimeout(timeoutVariable);
  }, [zoomType, markers]);

  return <>{consolidatedMarkers}</>;
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

// put longitude bounds within normal -180 to 180 range
function constrainLongitudeToMainWorld({
  southWest: { lat: south, lng: west },
  northEast: { lat: north, lng: east },
}: Bounds): Bounds {
  let newEast = east;
  let newWest = west;
  while (newEast > 180) {
    newEast -= 360;
  }
  while (newEast < -180) {
    newEast += 360;
  }
  while (newWest < -180) {
    newWest += 360;
  }
  while (newWest > 180) {
    newWest -= 360;
  }

  // fully zoomed out, the longitude bounds are often the same
  // but we need to make sure that west is slightly greater than east
  // so that they "wrap around" the whole globe
  // (if west was slightly less than east, it would represent a very tiny sliver)
  if (Math.abs(newEast - newWest) < 1e-8) newWest = newEast + 1e-8;

  return {
    southWest: { lat: south, lng: newWest },
    northEast: { lat: north, lng: newEast },
  };
}
