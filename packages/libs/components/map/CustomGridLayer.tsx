import {Polyline, useLeaflet} from "react-leaflet";
import React, {ReactElement, useEffect, useState} from "react";
import Geohash from "latlon-geohash";
import {LatLngBounds} from "leaflet";
// import shape2geohash from "shape2geohash";  // need @types ideally...
const shape2geohash = require("shape2geohash");

interface ZoomLevelToGeoHashLevel {
    zoomLevel: number
}

/**
 * Renders a custom grid layer made up of Rectangle components that have boundaries associated
 * with the geohashes available in the current map boundaries.
 **/
export default function CustomGridLayer() {
    const { map } = useLeaflet();

    const [geohashes, setGeohashes] = useState<string[]>([]);
    let polylines : ReactElement<Polyline>[]= [];
    const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

    useEffect(() => {
        if (map == null) return;

        function updateMap() {
            if (map != null) {
                const zoomLevel = map.getZoom();
                const geohashLevel = zoomLevelToGeoHashLevel({zoomLevel});

                const currentMapBounds = map.getBounds();
                // bfox6 - Make the current map bounds accessible to the outside world
                setMapBounds(currentMapBounds);
                /**
                 * bfox6 - Get current geohashes within the map boundary to a specified precision
                 * shape2geohash returns a promise so we resolve the promise and set the geohashes
                 * state within the 'then' callback.
                 **/
                Promise.resolve(shape2geohash([
                    [
                        [currentMapBounds.getNorthEast().lng, currentMapBounds.getNorthEast().lat],
                        [currentMapBounds.getNorthWest().lng, currentMapBounds.getNorthWest().lat],
                        [currentMapBounds.getSouthWest().lng, currentMapBounds.getSouthWest().lat],
                        [currentMapBounds.getSouthEast().lng, currentMapBounds.getSouthEast().lat],
                        [currentMapBounds.getNorthEast().lng, currentMapBounds.getNorthEast().lat]
                    ]
                ], {precision: geohashLevel})).then(function (value) {
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
        const lats: number[] = [];
        const lons: number[] = []

        // bfox6 - Get the unique latitude and longitude values for each geohash NE boundary
        geohashes.forEach(geohash => {
            const latlon = Geohash.bounds(geohash);
            if (lats.indexOf(latlon.ne.lat) < 0) {
                lats.push(latlon.ne.lat)
            }
            if (lats.indexOf(latlon.sw.lat) < 0) {
                lats.push(latlon.sw.lat)
            }
            if (lons.indexOf(latlon.ne.lon) < 0) {
                lons.push(latlon.ne.lon)
            }
            if (lons.indexOf(latlon.sw.lon) < 0) {
                lons.push(latlon.sw.lon)
            }
        });

        const latLines = lats.map((lat) => {
            return (
                <Polyline color="gray"
                          positions={[[lat, mapBounds.getWest()], [lat, mapBounds.getEast()]]}
                          opacity={.8}
                          weight={1}
                          dashArray={[10]}

                />
            )
        })

        const lonLines = lons.map((lon) => {
            return (
                <Polyline color="gray"
                          positions={[[mapBounds.getNorth(), lon], [mapBounds.getSouth(), lon]]}
                          opacity={.8}
                          weight={1}
                          dashArray={[10]}
                />
            )
        })
        polylines = [...latLines, ...lonLines];
    }

    return(<>{polylines}</>)
}

function zoomLevelToGeoHashLevel({zoomLevel}: ZoomLevelToGeoHashLevel) {
    const zoomLevelToGeohashLevelDefs = [
        1, // 0
        1, // 1
        1, // 2
        2, // 3
        2, // 4
        2, // 5
        3, // 6
        3, // 7
        3, // 8
        4, // 9
        4, // 10
        4, // 11
        5, // 12
        5, // 13
        5, // 14
        6, // 15
        6, // 16
        6, // 17
        7  // 18
    ];
    return(zoomLevelToGeohashLevelDefs[zoomLevel])
}
