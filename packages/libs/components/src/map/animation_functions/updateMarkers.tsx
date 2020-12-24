import {cloneElement, ReactElement} from "react";
import {MarkerProps} from "../Types";

export default function updateMarkers(toChangeMarkers: Array<ReactElement<MarkerProps>>,
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
        let markerCloneProps = {};
        if (matchingMarkers.length == 1) {
            // Clone marker element with new position
            markerCloneProps = {
                position: matchingMarkers[0].props.position
            };
        }

        return cloneElement(markerObj, markerCloneProps);
    });
}