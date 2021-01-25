// Minimal reproduction of popup error
// Steps:
// 1. Toggle on popups
// 2. Click marker to see popup
// 3. Toggle off popups. Popup will disappear.
// 4. Click marker and see empty popup.

import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

export default {
  title: 'Popup Errors',
  component: Map,
};

const position: [number,number] = [51.505, -0.09];

export const PopupError = () => {
  const [showPopup, setShowPopup] = React.useState(false);
  return (
    <>
    <button onClick={() => setShowPopup(val => !val)}>Toggle popups</button> (show: {showPopup ? 'true' : 'false'})
    <Map
      style={{ height: 500, width: 500 }}
      viewport={{center: position, zoom: 12}}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />
      <Marker position={position}>
        {showPopup && <Popup>
          Hello, world
        </Popup>}
      </Marker>
    </Map>
    </>
  )
}