import {Rectangle, useLeaflet} from "react-leaflet";
import React, {ReactElement, useEffect, useState} from "react";
import Geohash from "latlon-geohash";
import ZoomLevelToGeoHashLevel from "./utilities/ZoomLevelToGeoHashLevel";
const shape2geohash = require("shape2geohash");

/**
 * Renders a custom grid layer made up of Rectangle components that have boundaries associated
 * with the geohashes available in the current map boundaries.
 **/
export default function CustomGridLayer() {
    const { map } = useLeaflet();

    const [geohashes, setGeohashes] = useState<string[]>([]);
    const [gridTiles, setGridTiles] = useState<ReactElement<Rectangle>[]>([]);

    useEffect(() => {
        if (map == null) return;

        function updateMap() {
            if (map != null) {
                const zoomLevel = map.getZoom();
                const geohashLevel = ZoomLevelToGeoHashLevel({zoomLevel});
                console.log(geohashLevel)
                /**
                 * bfox6 - Get current geohashes within the map boundary to a specified precision
                 * shape2geohash returns a promise so we resolve the promise and set the geohashes
                 * state within the 'then' callback.
                 **/
                Promise.resolve(shape2geohash([
                    [
                        [map.getBounds().getNorthEast().lng, map.getBounds().getNorthEast().lat],
                        [map.getBounds().getNorthWest().lng, map.getBounds().getNorthWest().lat],
                        [map.getBounds().getSouthWest().lng, map.getBounds().getSouthWest().lat],
                        [map.getBounds().getSouthEast().lng, map.getBounds().getSouthEast().lat],
                        [map.getBounds().getNorthEast().lng, map.getBounds().getNorthEast().lat]
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

    useEffect(() => {
         // bfox6 - Get the boundaries of every geohash in the format the Rectangle component expects
        const geohashBoundaries = geohashes.map(geohash => {
            const latlon = Geohash.bounds(geohash);
            return [[latlon.ne.lat, latlon.ne.lon], [latlon.sw.lat, latlon.sw.lon]];
        });


        // bfox6 - Create a Rectangle component for every geohash boundary
        const geohashRectangles = geohashBoundaries.map(boundaries => {
            return (
                <Rectangle
                    key={boundaries.toString()}
                    bounds={boundaries}
                    color={"grey"}
                    weight={1}
                    fill={false}
                />
            )
        });
        setGridTiles([...geohashRectangles]);
    }, [geohashes]);


    return(<>{gridTiles}</>)
}