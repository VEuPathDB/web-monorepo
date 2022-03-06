import { Polyline, Rectangle, useMap } from 'react-leaflet';
import React, { ReactElement, useEffect, useState } from 'react';
import Geohash from 'latlon-geohash';
import L, { LatLngBounds } from 'leaflet';
// import shape2geohash from "shape2geohash";  // need @types ideally...
const shape2geohash = require('shape2geohash');

interface Props {
  zoomLevelToGeohashLevel: (leafletZoomLevel: number) => number;
}

/**
 * Renders a custom grid layer made up of Polyline components that have boundaries associated
 * with the geohashes available in the current map boundaries.
 **/
export default function CustomGridLayer({ zoomLevelToGeohashLevel }: Props) {
  // react-leaflet v3
  const map = useMap();

  const [geohashes, setGeohashes] = useState<string[]>([]);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  let polylines: ReactElement<typeof Polyline>[] = [];
  // Blinkers/blinders: rectangles on edges of viewport to visually block
  // nonactive map areas/extra worlds
  let blinkers: ReactElement<typeof Rectangle>[] = [];

  useEffect(() => {
    if (map == null) return;

    function updateMap() {
      if (map != null) {
        const zoomLevel = map.getZoom();
        const geohashLevel = zoomLevelToGeohashLevel(zoomLevel);
        const currentMapBounds = map.getBounds();
        let west = currentMapBounds.getWest();
        let east = currentMapBounds.getEast();
        // if very zoomed out, trim longitude bounds to span the middle 360 deg only
        if (east - west > 360) {
          const middle = (east + west) / 2;
          east = middle + 180;
          west = middle - 180;
        }

        // work out how many 360 degrees we are away from the 'main world'
        let longitudeCorrection = 0;
        while (west + longitudeCorrection > 180) {
          longitudeCorrection -= 360;
        }
        while (east + longitudeCorrection < -180) {
          longitudeCorrection += 360;
        }

        // bfox6 - Make the current map bounds accessible to the outside world
        setMapBounds(currentMapBounds);
        /**
         * bfox6 - Get current geohashes within the map boundary to a specified precision
         * shape2geohash returns a promise so we resolve the promise and set the geohashes
         * state within the 'then' callback.
         **/

        const shapes =
          west + longitudeCorrection >= -180 &&
          east + longitudeCorrection <= 180
            ? [
                // one rectangle
                [
                  [east + longitudeCorrection, currentMapBounds.getNorth()],
                  [west + longitudeCorrection, currentMapBounds.getNorth()],
                  [west + longitudeCorrection, currentMapBounds.getSouth()],
                  [east + longitudeCorrection, currentMapBounds.getSouth()],
                  [east + longitudeCorrection, currentMapBounds.getNorth()],
                ],
              ]
            : west + longitudeCorrection < -180
            ? [
                // two rectangles straddling -180 deg line
                [
                  [
                    // west of the line, move it over to the eastern side e.g. 120 to 180
                    [180.0, currentMapBounds.getNorth()],
                    [
                      west + longitudeCorrection + 360,
                      currentMapBounds.getNorth(),
                    ],
                    [
                      west + longitudeCorrection + 360,
                      currentMapBounds.getSouth(),
                    ],
                    [180.0, currentMapBounds.getSouth()],
                    [180.0, currentMapBounds.getNorth()],
                  ],
                ],
                [
                  [
                    // east of the line
                    [-180.0, currentMapBounds.getNorth()],
                    [east + longitudeCorrection, currentMapBounds.getNorth()],
                    [east + longitudeCorrection, currentMapBounds.getSouth()],
                    [-180.0, currentMapBounds.getSouth()],
                    [-180.0, currentMapBounds.getNorth()],
                  ],
                ],
              ]
            : east + longitudeCorrection > 180
            ? [
                // two rectangles straddling +180 deg line
                [
                  // west of the line is normal and truncated at 180
                  [
                    [180.0, currentMapBounds.getNorth()],
                    [west + longitudeCorrection, currentMapBounds.getNorth()],
                    [west + longitudeCorrection, currentMapBounds.getSouth()],
                    [180.0, currentMapBounds.getSouth()],
                    [180.0, currentMapBounds.getNorth()],
                  ],
                ],
                [
                  // east of the line needs shifting over to, e.g. -180 to -120
                  [
                    [-180.0, currentMapBounds.getNorth()],
                    [
                      east + longitudeCorrection - 360,
                      currentMapBounds.getNorth(),
                    ],
                    [
                      east + longitudeCorrection - 360,
                      currentMapBounds.getSouth(),
                    ],
                    [-180.0, currentMapBounds.getSouth()],
                    [-180.0, currentMapBounds.getNorth()],
                  ],
                ],
              ]
            : [
                // edge case return whole world rectangle
                [
                  [180.0, 90.0],
                  [-180.0, 90.0],
                  [-180.0, -90.0],
                  [180.0, -90.0],
                  [180.0, 90.0],
                ],
              ];

        Promise.resolve(
          shape2geohash(shapes, { precision: geohashLevel })
        ).then(function (value) {
          setGeohashes(value);
        });
      }
    }

    updateMap();
    map.on('resize dragend zoomend', updateMap);

    return () => {
      map.off('resize dragend zoomend', updateMap);
    };
  }, [map]);

  // bfox6 - Determine and build new polylines.
  if (mapBounds != null) {
    let west = mapBounds.getWest();
    let east = mapBounds.getEast();
    let adjustedWest = west;
    let adjustedEast = east;
    const eastWestDiff = east - west;

    // if very zoomed out, trim longitude bounds to span the middle 360 deg only
    if (eastWestDiff > 360) {
      const middle = (east + west) / 2;
      adjustedEast = middle + 181;
      adjustedWest = middle - 181;

      // Custom renderer that lets us draw shapes far past the map edges
      // (shapes will show while panning rather than appear after panning)
      const wideRenderer = L.svg({ padding: 2 });
      const color = 'black';
      const opacity = 0.3;

      blinkers = [
        <Rectangle
          key="east-blinker"
          bounds={[
            [-90, east + 1.5 * eastWestDiff],
            [90, adjustedEast],
          ]}
          stroke={false}
          color={color}
          fillOpacity={opacity}
          renderer={wideRenderer}
          interactive={false}
        ></Rectangle>,
        <Rectangle
          key="west-blinker"
          bounds={[
            [-90, west - 1.5 * eastWestDiff],
            [90, adjustedWest],
          ]}
          stroke={false}
          color={color}
          fillOpacity={opacity}
          renderer={wideRenderer}
          interactive={false}
        ></Rectangle>,
      ];
    }

    const lats: number[] = [];
    const lons: number[] = [];

    // bfox6 - Get the unique latitude and longitude values for each geohash NE boundary
    geohashes.forEach((geohash) => {
      const latlon = Geohash.bounds(geohash);
      if (lats.indexOf(latlon.ne.lat) < 0) {
        lats.push(latlon.ne.lat);
      }
      if (lats.indexOf(latlon.sw.lat) < 0) {
        lats.push(latlon.sw.lat);
      }
      if (lons.indexOf(latlon.ne.lon) < 0) {
        lons.push(latlon.ne.lon);
      }
      if (lons.indexOf(latlon.sw.lon) < 0) {
        lons.push(latlon.sw.lon);
      }
    });

    const latLines = lats.map((lat, index) => {
      return (
        <Polyline
          key={`lat-${lat}-${index}`}
          color="gray"
          positions={[
            [lat, adjustedEast],
            [lat, adjustedWest],
          ]}
          opacity={0.8}
          weight={1}
          dashArray={[10]}
          interactive={false}
        />
      );
    });

    const lonLines = lons.map((lon, index) => {
      // move the longitude lines into the current viewport, if required
      let adjustedLon = lon;
      let opacity = 0.8;
      while (adjustedLon > adjustedEast) {
        adjustedLon -= 360;
        if (lon == 180) opacity = 0; // only let this line be drawn once
      }
      while (adjustedLon < adjustedWest) {
        adjustedLon += 360;
        if (lon == -180) opacity = 0; // only let this line be drawn once
      }

      return (
        <Polyline
          key={`lon-${adjustedLon}-${index}`}
          color="gray"
          positions={[
            [mapBounds.getNorth(), adjustedLon],
            [mapBounds.getSouth(), adjustedLon],
          ]}
          opacity={opacity}
          weight={1}
          dashArray={[10]}
          interactive={false}
        />
      );
    });
    polylines = [...latLines, ...lonLines];
  }

  return (
    <>
      {polylines}
      {blinkers}
    </>
  );
}
