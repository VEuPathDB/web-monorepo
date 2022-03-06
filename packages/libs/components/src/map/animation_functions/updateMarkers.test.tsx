import React from 'react';
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import updateMarkers from './updateMarkers';

/**
 * Test the updateMarkers function by checking that the marker in 'toChangeMarkers' will accurately
 * find its corresponding marker in 'sourceMarkers' and adopt its position value.
 **/
test('updateMarkers Simple Test', () => {
  const toChangeMarkers = [
    <ReactLeafletDriftMarker
      key="th"
      duration={300}
      position={[23.03485420396439, 47.59188850065745]}
    />,
  ];
  const sourceMarkers = [
    <ReactLeafletDriftMarker
      key="t"
      duration={300}
      position={[19.268669954270678, -157.98994488168077]}
    />,
    <ReactLeafletDriftMarker
      key="ss"
      duration={300}
      position={[1.03485420396439, 1.59188850065745]}
    />,
  ];
  const changedMarkers = [
    <ReactLeafletDriftMarker
      key="th"
      duration={300}
      position={[19.268669954270678, -157.98994488168077]}
    />,
  ];
  expect(
    updateMarkers(toChangeMarkers, sourceMarkers, 1).map(
      (e) => e.props.position
    )
  ).toEqual(changedMarkers.map((e) => e.props.position));
});

/**
 * Test the updateMarkers function with a hash difference of 2
 * by checking that the marker in 'toChangeMarkers' will accurately
 * find its corresponding marker in 'sourceMarkers' and adopt its position value.
 **/
test('updateMarkers Extensive Test', () => {
  const toChangeMarkers = [
    <ReactLeafletDriftMarker
      key="th3"
      duration={300}
      position={[23.03485420396439, 47.59188850065745]}
    />,
    <ReactLeafletDriftMarker
      key="se1"
      duration={300}
      position={[45.12345, -45.12345]}
    />,
    <ReactLeafletDriftMarker
      key="se2"
      duration={300}
      position={[45.12345, -45.12345]}
    />,
  ];
  const sourceMarkers = [
    <ReactLeafletDriftMarker
      key="t"
      duration={300}
      position={[19.268669954270678, -157.98994488168077]}
    />,
    <ReactLeafletDriftMarker
      key="s"
      duration={300}
      position={[2.32134, -2.32134]}
    />,
  ];
  const changedMarkers = [
    <ReactLeafletDriftMarker
      key="th3"
      duration={300}
      position={[19.268669954270678, -157.98994488168077]}
    />,
    <ReactLeafletDriftMarker
      key="se1"
      duration={300}
      position={[2.32134, -2.32134]}
    />,
    <ReactLeafletDriftMarker
      key="se2"
      duration={300}
      position={[2.32134, -2.32134]}
    />,
  ];
  expect(
    updateMarkers(toChangeMarkers, sourceMarkers, 2).map(
      (e) => e.props.position
    )
  ).toEqual(changedMarkers.map((e) => e.props.position));
});
