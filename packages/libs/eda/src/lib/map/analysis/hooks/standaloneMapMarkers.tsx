import { useCallback, useMemo } from 'react';
import { usePromise } from '../../../core/hooks/promise';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../core/types/geoConfig';
import DataClient, {
  OverlayConfig,
  StandaloneMapMarkersRequestParams,
  StandaloneMapMarkersResponse,
} from '../../../core/api/DataClient';
import { Filter } from '../../../core/types/filter';
import { useDataClient } from '../../../core/hooks/workspace';
import { NumberRange } from '../../../core/types/general';
import { useDefaultAxisRange } from '../../../core/hooks/computeDefaultAxisRange';
import { isEqual, some } from 'lodash';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots';
import {
  kFormatter,
  mFormatter,
} from '../../../core/utils/big-number-formatters';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { VariableDescriptor } from '../../../core/types/variable';
import { useDeepValue } from '../../../core/hooks/immutability';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../..';
import { DonutMarkerProps } from '@veupathdb/components/lib/map/DonutMarker';
import { ChartMarkerProps } from '@veupathdb/components/lib/map/ChartMarker';

/**
 * We can use this viewport to request all available data
 */
export const GLOBAL_VIEWPORT = {
  latitude: {
    xMin: -90,
    xMax: 90,
  },
  longitude: {
    left: -180,
    right: 180,
  },
};

/**
 * Provides markers for use in the MapVEuMap component
 * Also provides associated data (stats, legend items), pending status and back end errors.
 *
 */

export interface StandaloneMapMarkersProps {
  /**
   * If boundsZoomLevel is undefined, then:
   *  - geoAggregateVariable will default to { entityId: geoConfig.entity.id, variableId: geoConfig.aggregationVariableIds[0] }
   *  - viewport will be set to the GLOBAL_VIEWPORT object
   *    - example use-case: data requests for MarkerPreview components pass in an undefined boundsZoomLevel in order to render a marker that aggregates all filtered data
   */
  boundsZoomLevel: BoundsViewport | undefined;
  //vizConfig: MapConfig;
  geoConfig: GeoConfig | undefined;
  studyId: string;
  filters: Filter[] | undefined;
  /** What has the user selected for the global overlay variable? */
  selectedOverlayVariable: VariableDescriptor | undefined;
  /** What is the full configuration for that overlay?
   * This is (sometimes) determined asynchronously from back end requests.
   */
  overlayConfig: OverlayConfig | undefined;
  outputEntityId: string | undefined;
  markerType: 'count' | 'proportion' | 'pie';
  dependentAxisLogScale?: boolean;
}

// what this hook returns
interface MapMarkers {
  /** the markers */
  markersData: DonutMarkerProps[] | ChartMarkerProps[] | undefined;
  /** `totalVisibleEntityCount` tells you how many entities are visible at a given viewport. But not necessarily with data for the overlay variable. */
  totalVisibleEntityCount: number | undefined;
  /** This tells you how many entities are on screen that also have data for the overlay variable
   * if there is one, otherwise it defaults to the totalVisibleEntityCount.
   * This number should always be the sum of the numbers in the center of the markers (assuming no checkboxes unchecked). */
  totalVisibleWithOverlayEntityCount: number | undefined;
  /** the possible values for the overlay variable (e.g. back-end derived bin labels) */
  //  vocabulary: string[] | undefined;
  /** data for creating a legend */
  legendItems: LegendItemsProps[];
  /** is the request pending? */
  pending: boolean;
  /** any error returned from the data request */
  error: unknown;
}

export function useStandaloneMapMarkers(
  props: StandaloneMapMarkersProps
): MapMarkers {
  const {
    boundsZoomLevel,
    geoConfig,
    selectedOverlayVariable: sov,
    overlayConfig: oc,
    outputEntityId,
    studyId,
    filters,
    markerType,
    dependentAxisLogScale = false,
  } = props;

  // these two deepvalue eliminate an unnecessary data request
  // when switching between pie and bar markers when using the same variable
  const selectedOverlayVariable = useDeepValue(sov);
  const overlayConfig = useDeepValue(oc);
  const overlayType = overlayConfig?.overlayType;

  const dataClient: DataClient = useDataClient();

  // prepare some info that the map-markers and overlay requests both need
  const { latitudeVariable, longitudeVariable } = useMemo(
    () =>
      geoConfig == null || geoConfig.entity.id == null
        ? {}
        : {
            latitudeVariable: {
              entityId: geoConfig.entity.id,
              variableId: geoConfig.latitudeVariableId,
            },
            longitudeVariable: {
              entityId: geoConfig.entity.id,
              variableId: geoConfig.longitudeVariableId,
            },
          },
    [geoConfig]
  );

  // handle the geoAggregateVariable separately because it changes with zoom level
  // and we don't want that to change overlayVariableAndEntity etc because that invalidates
  // the overlayConfigPromise

  const geoAggregateVariable = useMemo(
    () =>
      geoConfig != null
        ? {
            entityId: geoConfig.entity.id,
            variableId:
              // if boundsZoomLevel is undefined, we'll default to geoConfig.aggregationVariableIds[0]
              geoConfig.aggregationVariableIds[
                boundsZoomLevel
                  ? geoConfig.zoomLevelToAggregationLevel(
                      boundsZoomLevel.zoomLevel
                    ) - 1
                  : 0
              ],
          }
        : undefined,
    [boundsZoomLevel?.zoomLevel, geoConfig]
  );

  const rawPromise = usePromise<
    | {
        rawMarkersData: StandaloneMapMarkersResponse;
        vocabulary: string[] | undefined;
      }
    | undefined
  >(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        geoConfig == null ||
        latitudeVariable == null ||
        longitudeVariable == null ||
        geoAggregateVariable == null ||
        outputEntityId == null
      )
        return undefined;

      // Bail if overlayconfig hasn't been fully determined yet
      // (e.g. async updateOverlayConfig in MapAnalysis)
      // This prevents an extra unwanted back end request
      // for "no overlay" just before the request for an overlay
      if (
        selectedOverlayVariable != null &&
        !isEqual(selectedOverlayVariable, overlayConfig?.overlayVariable)
      )
        return undefined;

      const viewport = boundsZoomLevel
        ? {
            latitude: {
              xMin: boundsZoomLevel.bounds.southWest.lat,
              xMax: boundsZoomLevel.bounds.northEast.lat,
            },
            longitude: {
              left: boundsZoomLevel.bounds.southWest.lng,
              right: boundsZoomLevel.bounds.northEast.lng,
            },
          }
        : GLOBAL_VIEWPORT;

      // now prepare the rest of the request params
      const requestParams: StandaloneMapMarkersRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          geoAggregateVariable,
          latitudeVariable,
          longitudeVariable,
          overlayConfig,
          outputEntityId,
          valueSpec: markerType === 'pie' ? 'count' : markerType,
          viewport,
        },
      };

      // now get and return the data
      return {
        rawMarkersData: await dataClient.getStandaloneMapMarkers(
          'standalone-map',
          requestParams
        ),
        vocabulary:
          overlayType === 'categorical' // switch statement style guide time!!
            ? overlayConfig?.overlayValues
            : overlayType === 'continuous'
            ? overlayConfig?.overlayValues.map((ov) => ov.binLabel)
            : undefined,
      };
    }, [
      studyId,
      filters,
      dataClient,
      selectedOverlayVariable,
      overlayConfig,
      outputEntityId,
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      boundsZoomLevel,
      geoConfig,
      markerType,
    ])
  );

  const totalVisibleEntityCount: number | undefined =
    rawPromise.value?.rawMarkersData.mapElements.reduce((acc, curr) => {
      return acc + curr.entityCount;
    }, 0);

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
  const { valueMax, valueMinPos, countSum } = useMemo(
    () =>
      rawPromise.value?.rawMarkersData
        ? rawPromise.value.rawMarkersData.mapElements
            .flatMap((el) => el.overlayValues)
            .reduce(
              ({ valueMax, valueMinPos, countSum }, elem) => ({
                valueMax: Math.max(elem.value, valueMax),
                valueMinPos:
                  elem.value > 0 &&
                  (valueMinPos == null || elem.value < valueMinPos)
                    ? elem.value
                    : valueMinPos,
                countSum: (countSum ?? 0) + elem.count,
              }),
              {
                valueMax: 0,
                valueMinPos: undefined as number | undefined,
                countSum: undefined as number | undefined,
              }
            )
        : { valueMax: undefined, valueMinPos: undefined, countSum: undefined },
    [rawPromise.value?.rawMarkersData]
  );

  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    dependentAxisLogScale
  ) as NumberRange;

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const finalMarkersData = useMemo(() => {
    const vocabulary = rawPromise.value?.vocabulary;
    return rawPromise.value?.rawMarkersData.mapElements.map(
      ({
        geoAggregateValue,
        entityCount,
        avgLat,
        avgLon,
        minLat,
        minLon,
        maxLat,
        maxLon,
        overlayValues,
      }) => {
        const bounds = {
          southWest: { lat: minLat, lng: minLon },
          northEast: { lat: maxLat, lng: maxLon },
        };
        const position = { lat: avgLat, lng: avgLon };

        const donutData =
          vocabulary && overlayValues && overlayValues.length
            ? overlayValues.map(({ binLabel, value }) => ({
                label: binLabel,
                value: value,
                color:
                  overlayType === 'categorical'
                    ? ColorPaletteDefault[vocabulary.indexOf(binLabel)]
                    : gradientSequentialColorscaleMap(
                        vocabulary.length > 1
                          ? vocabulary.indexOf(binLabel) /
                              (vocabulary.length - 1)
                          : 0.5
                      ),
              }))
            : [];

        // TO DO: address diverging colorscale (especially if there are use-cases)

        // now reorder the data, adding zeroes if necessary.
        const reorderedData =
          vocabulary != null
            ? vocabulary.map(
                (
                  overlayLabel // overlay label can be 'female' or a bin label '(0,100]'
                ) =>
                  donutData.find(({ label }) => label === overlayLabel) ?? {
                    label: fixLabelForOtherValues(overlayLabel),
                    value: 0,
                  }
              )
            : // however, if there is no overlay data
              // provide a simple entity count marker in the palette's first colour
              [
                {
                  label: 'unknown',
                  value: entityCount,
                  color: '#333',
                },
              ];

        const count =
          vocabulary != null // if there's an overlay (all expected use cases)
            ? overlayValues
                .filter(({ binLabel }) => vocabulary.includes(binLabel))
                .reduce((sum, { count }) => (sum = sum + count), 0)
            : entityCount; // fallback if not

        const commonMarkerProps = {
          id: geoAggregateValue,
          key: geoAggregateValue,
          bounds: bounds,
          position: position,
          data: reorderedData,
          duration: defaultAnimationDuration,
        };

        switch (markerType) {
          case 'pie': {
            return {
              ...commonMarkerProps,
              markerLabel: kFormatter(count),
            } as DonutMarkerProps;
          }
          default: {
            return {
              ...commonMarkerProps,
              markerLabel: mFormatter(count),
              dependentAxisRange: defaultDependentAxisRange,
              dependentAxisLogScale,
            } as ChartMarkerProps;
          }
        }
      }
    );
  }, [
    rawPromise,
    markerType,
    overlayType,
    defaultDependentAxisRange,
    dependentAxisLogScale,
  ]);

  /**
   * create custom legend data
   */
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const vocabulary = rawPromise?.value?.vocabulary;
    if (vocabulary == null) return [];

    return vocabulary.map((label) => ({
      label: fixLabelForOtherValues(label),
      marker: 'square',
      markerColor:
        overlayType === 'categorical'
          ? ColorPaletteDefault[vocabulary.indexOf(label)]
          : overlayType === 'continuous'
          ? gradientSequentialColorscaleMap(
              vocabulary.length > 1
                ? vocabulary.indexOf(label) / (vocabulary.length - 1)
                : 0.5
            )
          : undefined,
      // has any geo-facet got an array of overlay data
      // containing at least one element that satisfies label==label
      hasData: rawPromise.value?.rawMarkersData
        ? some(rawPromise.value.rawMarkersData.mapElements, (el) =>
            el.overlayValues.some((ov) => ov.binLabel === label)
          )
        : false,
      group: 1,
      rank: 1,
    }));
  }, [rawPromise, overlayType]);

  return {
    markersData: finalMarkersData,
    totalVisibleWithOverlayEntityCount: countSum,
    totalVisibleEntityCount,
    legendItems,
    pending: rawPromise.pending,
    error: rawPromise.error,
  };
}

function fixLabelForOtherValues(input: string): string {
  return input === UNSELECTED_TOKEN ? UNSELECTED_DISPLAY_TEXT : input;
}
