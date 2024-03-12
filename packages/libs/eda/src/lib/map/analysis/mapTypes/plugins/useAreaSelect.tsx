import { useEffect } from 'react';
import { AppState } from '../../appState';
import { Bounds as BoundsProp } from '@veupathdb/components/lib/map/Types';
import { DonutMarkerProps } from '@veupathdb/components/lib/map/DonutMarker';
import { ChartMarkerProps } from '@veupathdb/components/lib/map/ChartMarker';
import { BubbleMarkerProps } from '@veupathdb/components/lib/map/BubbleMarker';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { OverlayConfig } from '../../../../core';

interface markerDataResponseProps {
  error: unknown;
  isFetching: boolean;
  markerProps?: DonutMarkerProps[] | ChartMarkerProps[] | BubbleMarkerProps[];
  legendItems?: LegendItemsProps[];
  overlayConfig?: OverlayConfig;
  boundsZoomLevel?: BoundsViewport | undefined;
}

export function useAreaSelect(
  appState: AppState,
  markerDataResponse: markerDataResponseProps,
  setSelectedMarkers: (selectedMarkers: string[] | undefined) => void,
  boxCoord: BoundsProp | undefined,
  markerProps?: DonutMarkerProps[] | ChartMarkerProps[] | BubbleMarkerProps[]
) {
  // set useEffect for area selection to change selectedMarkers via setSelectedmarkers
  // define useEffect here to avoid conditional call
  // thus, this contains duplicate code, selectedMarkers
  return useEffect(() => {
    if (
      !markerDataResponse.error &&
      !markerDataResponse.isFetching &&
      boxCoord != null
    ) {
      // define selectedMarkers
      const selectedMarkers = appState.markerConfigurations.find(
        (markerConfiguration) =>
          markerConfiguration.type === appState.activeMarkerConfigurationType
      )?.selectedMarkers;

      // find markers within area selection
      const boxCoordMarkers = markerProps
        ?.map((marker) => {
          // check if the center of a marker is within selected area
          return marker.position.lat >= boxCoord.southWest.lat &&
            marker.position.lat <= boxCoord.northEast.lat &&
            marker.position.lng >= boxCoord.southWest.lng &&
            marker.position.lng <= boxCoord.northEast.lng
            ? marker.id
            : '';
        })
        .filter((item: string) => item !== '');

      // then, update selectedMarkers & check duplicate markers
      setSelectedMarkers([
        ...(selectedMarkers ?? []),
        ...(boxCoordMarkers ?? [])
          .map((boxCoordMarker) => {
            return selectedMarkers?.some(
              (selectedMarker) => selectedMarker === boxCoordMarker
            )
              ? ''
              : boxCoordMarker;
          })
          .filter((item) => item !== ''),
      ]);
    }
    // additional dependency may cause infinite loop, e.g., markerDataResponse
  }, [boxCoord]);
}
