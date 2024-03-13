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
import { Bounds } from './Types';

interface AreaSelectProps {
  onAreaSelected: (value: Bounds | undefined) => void;
}

export default function AreaSelect({ onAreaSelected }: AreaSelectProps) {
  const map = useMap();

  useEffect(() => {
    if (!map.selectArea) return;

    map.getContainer().focus();
    map.selectArea.enable();
    map.selectArea.setControlKey(true);

    const handleAreaSelected = (e) => {
      const coordinates = e.bounds.toBBoxString().split(',').map(Number);
      onAreaSelected({
        southWest: { lat: coordinates[1], lng: coordinates[0] },
        northEast: { lat: coordinates[3], lng: coordinates[2] },
      });
    };

    map.on('areaselected', handleAreaSelected);

    const bounds = map.getBounds(); //.pad(-0.25); // this was limiting area selection to only the center of the map!
    map.selectArea.setValidate((layerPoint) => {
      return bounds.contains(map.layerPointToLatLng(layerPoint));
    });

    return function cleanup() {
      map.selectArea.disable();
      map.off('areaselected', handleAreaSelected);
      map.selectArea.setValidate(null);
    };
  }, [map, onAreaSelected]);

  return null;
}
