import { useCallback } from 'react';
import { AppState } from '../../appState';
import { Bounds, MarkerProps } from '@veupathdb/components/lib/map/Types';

// just defining the props we are using
interface EssentialMarkerDataResponseProps {
  error: unknown;
  isFetching: boolean;
  // donut and bar
  markerProps?: MarkerProps[];
  // bubble is different!
  data?: {
    markersData?: MarkerProps[];
  };
}

export function useOnAreaSelected(
  appState: AppState,
  markerDataResponse: EssentialMarkerDataResponseProps,
  setSelectedMarkers: (selectedMarkers: string[] | undefined) => void
) {
  return useCallback(
    (boxCoord: Bounds | undefined) => {
      if (
        !markerDataResponse.error &&
        !markerDataResponse.isFetching &&
        boxCoord != null
      ) {
        // retrieve selectedMarkers from appState
        const selectedMarkers = appState.markerConfigurations.find(
          (markerConfiguration) =>
            markerConfiguration.type === appState.activeMarkerConfigurationType
        )?.selectedMarkers;

        const markerProps =
          markerDataResponse.markerProps ??
          markerDataResponse.data?.markersData;

        // find markers within area selection
        const boxCoordMarkers = markerProps
          ?.filter((marker) => {
            // check if the center of a marker is within selected area
            return (
              marker.position.lat >= boxCoord.southWest.lat &&
              marker.position.lat <= boxCoord.northEast.lat &&
              marker.position.lng >= boxCoord.southWest.lng &&
              marker.position.lng <= boxCoord.northEast.lng
            );
          })
          .map(({ id }) => id);

        // combine, de-duplicate, and update selected marker IDs
        const combinedMarkers = [
          ...(selectedMarkers ?? []),
          ...(boxCoordMarkers ?? []),
        ];
        setSelectedMarkers(Array.from(new Set(combinedMarkers)));
      }
    },
    [appState, markerDataResponse, setSelectedMarkers]
  );
}
