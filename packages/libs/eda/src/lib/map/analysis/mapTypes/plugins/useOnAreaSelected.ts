import { useCallback } from 'react';
import { AppState } from '../../appState';
import { Bounds, MarkerProps } from '@veupathdb/components/lib/map/Types';

export function useOnAreaSelected(
  appState: AppState,
  markerProps: MarkerProps[] | undefined,
  setSelectedMarkers: (selectedMarkers: string[] | undefined) => void
) {
  return useCallback(
    (boxCoord: Bounds | undefined) => {
      if (boxCoord != null) {
        // retrieve selectedMarkers from appState
        const selectedMarkers = appState.markerConfigurations.find(
          (markerConfiguration) =>
            markerConfiguration.type === appState.activeMarkerConfigurationType
        )?.selectedMarkers;

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
    [appState, markerProps, setSelectedMarkers]
  );
}
