import {Rectangle, useLeaflet} from "react-leaflet";
import React, { useEffect, useState} from "react";
import Geohash from "latlon-geohash";
const shape2geohash = require("shape2geohash");

interface CustomGridLayer {
    level: number
}

export default function CustomGridLayer({level}: CustomGridLayer) {
    const { map } = useLeaflet();
    const [geohashes, setGeohashes] = useState([]);

    useEffect(() => {
        if (map != undefined) {
            Promise.resolve(shape2geohash([
                [
                    [map.getBounds().getNorthEast().lat, map.getBounds().getNorthEast().lng],
                    [map.getBounds().getNorthWest().lat, map.getBounds().getNorthWest().lng],
                    [map.getBounds().getSouthWest().lat, map.getBounds().getSouthWest().lng],
                    [map.getBounds().getSouthEast().lat, map.getBounds().getSouthEast().lng],
                    [map.getBounds().getNorthEast().lat, map.getBounds().getNorthEast().lng]
                ]
            ])).then(function (value) {
                setGeohashes(value);
            });
        }
    }, [map]);

    console.log(geohashes);

    const tiles = geohashes.map(geohash => {
        const latlon = Geohash.bounds(geohash);
        return [[latlon.ne.lat, latlon.ne.lon], [latlon.sw.lat, latlon.sw.lon]]
    });

    console.log(tiles);

    const gridTiles =
        tiles.map(tileBoundaries => {

            return (
                <Rectangle
                    key={tileBoundaries.toString()}
                    // @ts-ignore
                    bounds={tileBoundaries}
                    color={"blue"}
                    weight={10}
                    fill={false}
                />
            )
        });
    console.log(gridTiles);

    return(gridTiles)
}