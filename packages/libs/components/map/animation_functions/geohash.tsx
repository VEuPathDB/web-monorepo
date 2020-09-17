import {MarkerProps} from "../Types";
import {cloneElement, ReactElement} from "react";

interface geoHashAnimation {
    prevMarkers: Array<ReactElement<MarkerProps>>,
    markers: Array<ReactElement<MarkerProps>>,
    setZoomType: (zoomType: string | null) => void,
    setConsolidatedMarkers: (markers: ReactElement<MarkerProps>[]) => void,
}

export default function geohashAnimation({prevMarkers,
                                             markers,
                                             setZoomType,
                                             setConsolidatedMarkers}: geoHashAnimation) {
    const prevGeoHash = prevMarkers[0].key as string;
    const currentGeohash = markers[0].key as string;

    /** Zoom Out - Move existing markers to new position
     * Existing GeoHash = gcwr
     * New Geohash      = gcw
     **/
    if (prevGeoHash.length > currentGeohash.length) {
        setZoomType('out');
        const hashDif = prevGeoHash.length - currentGeohash.length;
        // Get a new array of existing markers with new position property
        const cloneArray = updateMarkers(prevMarkers, markers, hashDif);
        // Combine the new and existing markers
        setConsolidatedMarkers([...markers, ...cloneArray]);
    }
    /** Zoom In - New markers start at old position
     * Existing GeoHash = gcw
     * New Geohash      = gcwr
     **/
    else if (prevGeoHash.length < currentGeohash.length) {
        setZoomType('in');
        const hashDif = currentGeohash.length - prevGeoHash.length;
        // Get a new array of new markers with existing position property
        const cloneArray = updateMarkers(markers, prevMarkers, hashDif);
        // Set final render markers to the cloneArray which holds the new markers with
        // their new starting location
        setConsolidatedMarkers(cloneArray)
    }
    /** No difference in geohashes - Render markers as they are **/
    else {
        setZoomType(null);
        setConsolidatedMarkers([...markers])
    }
}

function updateMarkers(toChangeMarkers: Array<ReactElement<MarkerProps>>,
                       sourceMarkers: Array<ReactElement<MarkerProps>>,
                       hashDif: number) {
    return toChangeMarkers.map((markerObj) => {
        // Calculate the matching geohash
        const sourceKey = markerObj.key as string;
        const sourceHash = sourceKey.slice(0, -hashDif);

        // Find the object with the matching geohash
        const matchingMarkers = sourceMarkers.filter(obj => {
            return obj.key === sourceHash
        });

        // Clone marker element with new position
        const markerCloneProps = {
            position: matchingMarkers[0].props.position
        };
        return cloneElement(markerObj, markerCloneProps);
    });

}