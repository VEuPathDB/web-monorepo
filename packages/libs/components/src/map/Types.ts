import { ReactElement } from "react";
import {LatLngBoundsLiteral, LatLngLiteral, Icon} from "leaflet";

// does this need to be imported from react-leaflet properly? (see above)
export interface Viewport {
  center: LatLngLiteral,
  zoom: number
}

export interface MarkerProps {
  position: LatLngLiteral,
  key: string,
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


/*
  This is the geo-related information that any marker data request will need
*/

export interface BoundsViewport {
  bounds: LatLngBoundsLiteral,
  zoomLevel: number
}
