import React, { createElement } from 'react';
import { DriftMarker } from 'leaflet-drift-marker/lib';
import updateMarkers from "./updateMarkers";

test("updateMarkers", () => {
    const toChangeMarkers = [
        <DriftMarker key="th" duration={300} position={[23.03485420396439,47.59188850065745]}/>
    ];
    const sourceMarkers = [
        <DriftMarker key="t" duration={300} position={[19.268669954270678,-157.98994488168077]}/>
    ];
    const changedMarkers = [
        <DriftMarker key="th" duration={300} position={[19.268669954270678,-157.98994488168077]}/>
    ];
    expect(updateMarkers(toChangeMarkers, sourceMarkers, 1).map(e => e.props.position)).toEqual(changedMarkers.map(e => e.props.position));
})
