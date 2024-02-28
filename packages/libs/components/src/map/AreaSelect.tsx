/*
 * Select area by ctrl + mouse
 */

// several type errors because leaflet-area-select does not have type definition
// so ignore it for now
// @ts-nocheck
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// load modified leaflet-area-select directly
import './AreaSelectHack.js';
import { Bounds as BoundsProp } from './Types';

interface AreaSelectProps {
  setBoxCoord: (value: React.SetStateAction<BoundsProp | undefined>) => void;
}

export default function AreaSelect({ setBoxCoord }: AreaSelectProps) {
  const map = useMap();

  useEffect(() => {
    if (!map.selectArea) return;

    // map focus
    map.getContainer().focus();

    map.selectArea.enable();

    // use ctrl key
    map.selectArea.setControlKey(true);

    // get coordinates of selected area
    map.on('areaselected', (e) => {
      const coordinates = e.bounds.toBBoxString().split(',').map(Number);
      // coordinates format is SW lng & lon and NE lng & lon
      // so converting to SW lat & lng and NE lat & lng and set boxCoord
      setBoxCoord({
        southWest: { lat: coordinates[1], lng: coordinates[0] },
        northEast: { lat: coordinates[3], lng: coordinates[2] },
      });
    });

    // restrict selection area
    const bounds = map.getBounds().pad(-0.25);
    // check restricted area on start and move
    map.selectArea.setValidate((layerPoint) => {
      return bounds.contains(this._map.layerPointToLatLng(layerPoint));
    });

    // switch it off
    map.selectArea.setValidate();
  }, []);

  return null;
}
