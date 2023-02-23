import React from 'react';
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import geohashAnimation from './geohash';

/**
 * Test the geohashAnimation function when changing geohash levels by zooming out on the map.
 * The markers returned by geohashAnimation() should be a combination of `prevMarkers` and `markers`
 * but with the 'prevMarkers' having the position of their corresponding markers in 'markers'.
 **/
test('geohashAnimation Test Zoom Out', () => {
  const prevMarkers = [
    <ReactLeafletDriftMarker
      key="s4"
      duration={300}
      position={[13.358364615553013, 3.631169935744354]}
    />,
    <ReactLeafletDriftMarker
      key="ss"
      duration={300}
      position={[25.2892312465586986, 26.815620696122913]}
    />,
    <ReactLeafletDriftMarker
      key="ef"
      duration={300}
      position={[13.959481044496245, -5.138152139710619]}
    />,
    <ReactLeafletDriftMarker
      key="ek"
      duration={300}
      position={[26.38014227045334, -25.393817216106076]}
    />,
  ];
  const markers = [
    <ReactLeafletDriftMarker
      key="s"
      duration={300}
      position={[21.44259422204456, 24.653569344484673]}
    />,
    <ReactLeafletDriftMarker
      key="e"
      duration={300}
      position={[20.285180723713538, -22.450051253974742]}
    />,
  ];

  const consolidatedMarkers = [
    <ReactLeafletDriftMarker
      key="s"
      duration={300}
      position={[21.44259422204456, 24.653569344484673]}
    />,
    <ReactLeafletDriftMarker
      key="e"
      duration={300}
      position={[20.285180723713538, -22.450051253974742]}
    />,
    <ReactLeafletDriftMarker
      key="s4"
      duration={300}
      position={[21.44259422204456, 24.653569344484673]}
    />,
    <ReactLeafletDriftMarker
      key="ss"
      duration={300}
      position={[21.44259422204456, 24.653569344484673]}
    />,
    <ReactLeafletDriftMarker
      key="ef"
      duration={300}
      position={[20.285180723713538, -22.450051253974742]}
    />,
    <ReactLeafletDriftMarker
      key="ek"
      duration={300}
      position={[20.285180723713538, -22.450051253974742]}
    />,
  ];

  expect(geohashAnimation({ prevMarkers, markers })).toEqual({
    zoomType: 'out',
    markers: consolidatedMarkers,
  });
});

/**
 * Test the geohashAnimation function when changing geohash levels by zooming in on the map.
 * The markers returned by geohashAnimation() should be the same markers as `markers` but with
 * their corresponding markers position in `prevMarkers`.
 **/
test('geohashAnimation Test Zoom In', () => {
  const prevMarkers = [
    <ReactLeafletDriftMarker
      key="s5"
      duration={300}
      position={[13.358364615553013, 3.631169935744354]}
    />,
    <ReactLeafletDriftMarker
      key="eg"
      duration={300}
      position={[20.141388513611634, -8.50605386847217]}
    />,
    <ReactLeafletDriftMarker
      key="ee"
      duration={300}
      position={[20.324054274955447, -13.095442848374027]}
    />,
    <ReactLeafletDriftMarker
      key="s7"
      duration={300}
      position={[19.31251460537383, 13.349973386591978]}
    />,
  ];
  const markers = [
    <ReactLeafletDriftMarker
      key="eg9"
      duration={300}
      position={[20.14413881398737, -9.271836495548486]}
    />,
    <ReactLeafletDriftMarker
      key="eg8"
      duration={300}
      position={[20.34321973971558, -10.994169439467523]}
    />,
    <ReactLeafletDriftMarker
      key="eex"
      duration={300}
      position={[20.411717358629183, -11.338434852293435]}
    />,
    <ReactLeafletDriftMarker
      key="s53"
      duration={300}
      position={[19.484916776418686, 1.850087195634842]}
    />,
    <ReactLeafletDriftMarker
      key="egs"
      duration={300}
      position={[20.66991430554539, -5.579778789505362]}
    />,
    <ReactLeafletDriftMarker
      key="s56"
      duration={300}
      position={[19.57330361008644, 3.5418114066123962]}
    />,
    <ReactLeafletDriftMarker
      key="s5e"
      duration={300}
      position={[20.085304453969, 4.520733207464218]}
    />,
  ];

  const consolidatedMarkers = [
    <ReactLeafletDriftMarker
      key="eg9"
      duration={300}
      position={[20.141388513611634, -8.50605386847217]}
    />,
    <ReactLeafletDriftMarker
      key="eg8"
      duration={300}
      position={[20.141388513611634, -8.50605386847217]}
    />,
    <ReactLeafletDriftMarker
      key="eex"
      duration={300}
      position={[20.324054274955447, -13.095442848374027]}
    />,
    <ReactLeafletDriftMarker
      key="s53"
      duration={300}
      position={[13.358364615553013, 3.631169935744354]}
    />,
    <ReactLeafletDriftMarker
      key="egs"
      duration={300}
      position={[20.141388513611634, -8.50605386847217]}
    />,
    <ReactLeafletDriftMarker
      key="s56"
      duration={300}
      position={[13.358364615553013, 3.631169935744354]}
    />,
    <ReactLeafletDriftMarker
      key="s5e"
      duration={300}
      position={[13.358364615553013, 3.631169935744354]}
    />,
  ];

  expect(geohashAnimation({ prevMarkers, markers })).toEqual({
    zoomType: 'in',
    markers: consolidatedMarkers,
  });
});

/**
 * Test the geohashAnimation function when no geohash level changes.
 * The markers returned by geohashAnimation() should be the same as 'markers' because the final
 * markers are just themselves without adopting any previous marker's position.
 **/
test('geohashAnimation Test No Geohash Level Change', () => {
  const prevMarkers = [
    <ReactLeafletDriftMarker
      key="s5"
      duration={300}
      position={[13.358364615553013, 3.631169935744354]}
    />,
    <ReactLeafletDriftMarker
      key="eg"
      duration={300}
      position={[20.141388513611634, -8.50605386847217]}
    />,
    <ReactLeafletDriftMarker
      key="ee"
      duration={300}
      position={[20.324054274955447, -13.095442848374027]}
    />,
    <ReactLeafletDriftMarker
      key="s7"
      duration={300}
      position={[19.31251460537383, 13.349973386591978]}
    />,
  ];
  const markers = [
    <ReactLeafletDriftMarker
      key="sk"
      duration={300}
      position={[22.866956326588394, 20.577327883303756]}
    />,
    <ReactLeafletDriftMarker
      key="s5"
      duration={300}
      position={[20.358054478340676, 6.558497609905632]}
    />,
    <ReactLeafletDriftMarker
      key="s7"
      duration={300}
      position={[19.036241344776727, 17.9030743724029]}
    />,
    <ReactLeafletDriftMarker
      key="e5"
      duration={300}
      position={[19.261883039889224, -34.69625242853028]}
    />,
    <ReactLeafletDriftMarker
      key="e7"
      duration={300}
      position={[19.954705996658447, -6.564843262976187]}
    />,
    <ReactLeafletDriftMarker
      key="eg"
      duration={300}
      position={[19.954705996658447, -6.564843262976187]}
    />,
    <ReactLeafletDriftMarker
      key="se"
      duration={300}
      position={[19.158619432001966, 26.357300752741388]}
    />,
    <ReactLeafletDriftMarker
      key="ee"
      duration={300}
      position={[18.961153699131277, -16.07491334436086]}
    />,
    <ReactLeafletDriftMarker
      key="eu"
      duration={300}
      position={[22.856068690527856, -9.95805172106707]}
    />,
    <ReactLeafletDriftMarker
      key="ss"
      duration={300}
      position={[22.75187004322711, 29.514681188619665]}
    />,
    <ReactLeafletDriftMarker
      key="sh"
      duration={300}
      position={[22.690708400896824, 1.0275759186113316]}
    />,
    <ReactLeafletDriftMarker
      key="eh"
      duration={300}
      position={[22.561317309737206, -35.75987979769707]}
    />,
    <ReactLeafletDriftMarker
      key="es"
      duration={300}
      position={[22.95146606862545, -12.638816982507706]}
    />,
  ];

  expect(geohashAnimation({ prevMarkers, markers })).toEqual({
    zoomType: null,
    markers: markers,
  });
});
