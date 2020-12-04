import { ReactElement } from "react";
import { LatLngLiteral, Icon } from "leaflet";
import { PopupProps } from 'react-leaflet';

export type LatLng = LatLngLiteral;
// from leaflet:
// interface LatLngLiteral {
//    lat: number;
//    lng: number;
//}

export interface Bounds {
  southWest: LatLng,
  northEast: LatLng
};

/*
  This is the information Leaflet needs in order to show a map.
*/
export interface Viewport {
  center: LatLng,
  zoom: number
}

/*
  This is information Leaflet *provides* that we use for fetching/generating markers.
*/

export interface BoundsViewport {
  bounds: Bounds,
  zoomLevel: number
}

export interface MarkerProps {
  position: LatLng,
  id: string,
  popup?: ReactElement<PopupProps>,
  showPopup?: boolean,
  icon?: Icon,
}

export type AnimationFunction = (
    {
      prevMarkers,
      markers
    }: {
      prevMarkers: ReactElement<MarkerProps>[];
      markers: ReactElement<MarkerProps>[];
    }) => {
        zoomType: string | null;
        markers: ReactElement<MarkerProps>[];
    };


