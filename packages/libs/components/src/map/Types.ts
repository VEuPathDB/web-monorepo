import { ReactElement } from "react";
import { LatLngLiteral, Icon } from "leaflet";

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
  icon?: Icon
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


/**
 * Utility type to extract the Props type from a React Component
 * @example type Props = ExtractProps<typeof MyComponent>;
 */
export type ExtractProps<T> = T extends React.ComponentType<infer Props> ? Props : never;
