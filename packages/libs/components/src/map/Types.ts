import { ReactElement } from 'react';
import { LatLngLiteral, Icon } from 'leaflet';

export type LatLng = LatLngLiteral;
// from leaflet:
// interface LatLngLiteral {
//    lat: number;
//    lng: number;
//}

export interface Bounds {
  southWest: LatLng;
  northEast: LatLng;
}

/*
  This is information Leaflet *provides* that we use for fetching/generating markers.
*/

export interface BoundsViewport {
  bounds: Bounds;
  zoomLevel: number;
}

export interface MarkerProps {
  position: LatLng;
  id: string;
  icon?: Icon;
  showPopup?: boolean;
  popupContent?: {
    content: ReactElement;
    size: {
      width: number;
      height: number;
    };
  };
  /* A class to add to the popup element */
  popupClass?: string;
  // initialPopupAnchorYPosition?: (markerCenterY: number) => number;
  // maybe change these to take the whole rect object instead of just the center
  getVerticalPopupExtraOffset?: (
    markerCenter: [number, number]
  ) => [number, number];
  getHorizontalPopupExtraOffset?: (
    markerCenter: [number, number]
  ) => [number, number];
  /* This offset gets added to the default zIndex */
  zIndexOffset?: number;
}

export type AnimationFunction<T extends MarkerProps = MarkerProps> = ({
  prevMarkers,
  markers,
}: {
  prevMarkers: ReactElement<T>[];
  markers: ReactElement<T>[];
}) => {
  zoomType: string | null;
  markers: ReactElement<T>[];
};

/**
 * Utility type to extract the Props type from a React Component
 * @example type Props = ExtractProps<typeof MyComponent>;
 */
export type ExtractProps<T> = T extends React.ComponentType<infer Props>
  ? Props
  : never;
