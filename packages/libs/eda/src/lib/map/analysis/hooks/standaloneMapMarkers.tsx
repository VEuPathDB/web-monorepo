import { useCallback, useMemo } from 'react';
import { usePromise } from '../../../core/hooks/promise';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../core/types/geoConfig';
import DataClient, {
  BubbleOverlayConfig,
  OverlayConfig,
  StandaloneMapBubblesLegendRequestParams,
  StandaloneMapBubblesLegendResponse,
  StandaloneMapBubblesRequestParams,
  StandaloneMapBubblesResponse,
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
  getValueToGradientColorMapper,
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
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../constants';
import { DonutMarkerProps } from '@veupathdb/components/lib/map/DonutMarker';
import {
  ChartMarkerProps,
  BaseMarkerData,
} from '@veupathdb/components/lib/map/ChartMarker';
import { BubbleMarkerProps } from '@veupathdb/components/lib/map/BubbleMarker';
import { validateProportionValues } from '../MarkerConfiguration/BubbleMarkerConfigurationMenu';
import _ from 'lodash';

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
  overlayConfig: OverlayConfig | BubbleOverlayConfig | undefined;
  outputEntityId: string | undefined;
  markerType: 'count' | 'proportion' | 'pie' | 'bubble';
  dependentAxisLogScale?: boolean;
}

/** We use the count data in the marker previews for continuous vars */
interface DonutMarkerDataWithCounts extends BaseMarkerData {
  count: number;
}
interface ChartMarkerDataWithCounts extends BaseMarkerData {
  count: number;
}

export type DonutMarkerPropsWithCounts = Omit<DonutMarkerProps, 'data'> & {
  data: DonutMarkerDataWithCounts[];
};

export type ChartMarkerPropsWithCounts = Omit<ChartMarkerProps, 'data'> & {
  data: ChartMarkerDataWithCounts[];
};

// what this hook returns
interface MapMarkers {
  /** the markers */
  markersData:
    | DonutMarkerPropsWithCounts[]
    | ChartMarkerPropsWithCounts[]
    | BubbleMarkerProps[]
    | undefined;
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
  bubbleLegendData?: StandaloneMapBubblesLegendResponse;
  bubbleValueToDiameterMapper?: (value: number) => number;
  bubbleValueToColorMapper?: (value: number) => string;
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
  const overlayType = overlayConfig
    ? 'overlayType' in overlayConfig
      ? overlayConfig.overlayType
      : overlayConfig.aggregationConfig.overlayType
    : undefined;

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
                boundsZoomLevel?.zoomLevel != null
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
        rawMarkersData:
          | StandaloneMapMarkersResponse
          | StandaloneMapBubblesResponse;
        vocabulary: string[] | undefined;
        bubbleLegendData?: {
          minColorValue: number;
          maxColorValue: number;
          minSizeValue: number;
          maxSizeValue: number;
        };
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

      if (markerType === 'bubble') {
        const bubbleOverlayConfig = overlayConfig as
          | BubbleOverlayConfig
          | undefined;
        const aggregationConfig = bubbleOverlayConfig?.aggregationConfig;
        const numeratorValues =
          aggregationConfig && 'numeratorValues' in aggregationConfig
            ? aggregationConfig.numeratorValues
            : undefined;
        const denominatorValues =
          aggregationConfig && 'denominatorValues' in aggregationConfig
            ? aggregationConfig.denominatorValues
            : undefined;

        if (
          !aggregationConfig ||
          numeratorValues?.length === 0 ||
          denominatorValues?.length === 0 ||
          !validateProportionValues(numeratorValues, denominatorValues)
        ) {
          return undefined;
        }

        const markerRequestParams: StandaloneMapBubblesRequestParams = {
          studyId,
          filters: filters || [],
          config: {
            geoAggregateVariable,
            latitudeVariable,
            longitudeVariable,
            overlayConfig: bubbleOverlayConfig,
            outputEntityId,
            valueSpec: 'count',
            viewport,
          },
        };

        const legendRequestParams: StandaloneMapBubblesLegendRequestParams = {
          studyId,
          filters: filters || [],
          config: {
            outputEntityId,
            colorLegendConfig: {
              geoAggregateVariable: {
                entityId: geoConfig.entity.id,
                variableId: geoConfig.aggregationVariableIds.at(-1) as string,
              },
              quantitativeOverlayConfig: bubbleOverlayConfig,
            },
            sizeConfig: {
              geoAggregateVariable: {
                entityId: geoConfig.entity.id,
                variableId: geoConfig.aggregationVariableIds[0],
              },
            },
          },
        };

        const [rawMarkersData, bubbleLegendData] = await Promise.all([
          dataClient.getStandaloneBubbles(
            'standalone-map',
            markerRequestParams
          ),
          dataClient.getStandaloneBubblesLegend(
            'standalone-map',
            legendRequestParams
          ),
        ]);

        return {
          rawMarkersData,
          bubbleLegendData,
          vocabulary: undefined,
        };
      } else {
        const standardOverlayConfig = overlayConfig as
          | OverlayConfig
          | undefined;
        const requestParams: StandaloneMapMarkersRequestParams = {
          studyId,
          filters: filters || [],
          config: {
            geoAggregateVariable,
            latitudeVariable,
            longitudeVariable,
            overlayConfig: standardOverlayConfig,
            outputEntityId,
            valueSpec: markerType === 'pie' ? 'count' : markerType,
            viewport,
          },
        };

        return {
          rawMarkersData: await dataClient.getStandaloneMapMarkers(
            'standalone-map',
            requestParams
          ),
          vocabulary:
            overlayType === 'categorical' // switch statement style guide time!!
              ? (standardOverlayConfig?.overlayValues as string[])
              : overlayType === 'continuous'
              ? standardOverlayConfig?.overlayValues.map((ov) =>
                  typeof ov === 'object' ? ov.binLabel : ''
                )
              : undefined,
        };
      }
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
      overlayType,
    ])
  );

  const totalVisibleEntityCount: number | undefined = rawPromise.value
    ? (
        rawPromise.value.rawMarkersData.mapElements as Array<{
          entityCount: number;
        }>
      ).reduce((acc, curr) => {
        return acc + curr.entityCount;
      }, 0)
    : undefined;

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
  const { valueMax, valueMinPos, countSum } = useMemo(
    () =>
      (markerType === 'count' || markerType === 'proportion') &&
      rawPromise.value
        ? rawPromise.value.rawMarkersData.mapElements
            .flatMap((el) => ('overlayValues' in el ? el.overlayValues : []))
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
    [markerType, rawPromise.value]
  );

  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    dependentAxisLogScale
  ) as NumberRange;

  const vocabulary = rawPromise.value?.vocabulary;
  const bubbleLegendData = rawPromise.value?.bubbleLegendData;

  const adjustedSizeData = useMemo(
    () =>
      bubbleLegendData &&
      bubbleLegendData.minSizeValue === bubbleLegendData.maxSizeValue
        ? {
            minSizeValue: 0,
            maxSizeValue: bubbleLegendData.maxSizeValue || 1,
          }
        : undefined,
    [bubbleLegendData]
  );
  const adjustedColorData = useMemo(
    () =>
      bubbleLegendData &&
      bubbleLegendData.minColorValue === bubbleLegendData.maxColorValue
        ? bubbleLegendData.maxColorValue >= 0
          ? {
              minColorValue: 0,
              maxColorValue: bubbleLegendData.maxColorValue || 1,
            }
          : {
              minColorValue: bubbleLegendData.minColorValue,
              maxColorValue: 0,
            }
        : undefined,
    [bubbleLegendData]
  );
  const adjustedBubbleLegendData = useMemo(
    () =>
      bubbleLegendData
        ? {
            ...bubbleLegendData,
            ...adjustedSizeData,
            ...adjustedColorData,
          }
        : undefined,
    [adjustedColorData, adjustedSizeData, bubbleLegendData]
  );

  const bubbleValueToDiameterMapper = useMemo(
    () =>
      markerType === 'bubble' && adjustedBubbleLegendData
        ? (value: number) => {
            // const largestCircleArea = 9000;
            const largestCircleDiameter = 90;
            const smallestCircleDiameter = 10;

            // Area scales directly with value
            // const constant = largestCircleArea / maxOverlayCount;
            // const area = value * constant;
            // const radius = Math.sqrt(area / Math.PI);

            // Radius scales with log_10 of value
            // const constant = 20;
            // const radius = Math.log10(value) * constant;

            // Radius scales directly with value
            // y = mx + b, m = (y2 - y1) / (x2 - x1), b = y1 - m * x1
            const m =
              (largestCircleDiameter - smallestCircleDiameter) /
              (adjustedBubbleLegendData.maxSizeValue -
                adjustedBubbleLegendData.minSizeValue);
            const b =
              smallestCircleDiameter -
              m * adjustedBubbleLegendData.minSizeValue;
            const diameter = m * value + b;

            // return 2 * radius;
            return diameter;
          }
        : undefined,
    [adjustedBubbleLegendData, markerType]
  );

  const bubbleValueToColorMapper = useMemo(
    () =>
      markerType === 'bubble' && adjustedBubbleLegendData
        ? getValueToGradientColorMapper(
            adjustedBubbleLegendData.minColorValue,
            adjustedBubbleLegendData.maxColorValue
          )
        : undefined,
    [adjustedBubbleLegendData, markerType]
  );

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const finalMarkersData = useMemo(() => {
    if (rawPromise.value == null) return undefined;

    return markerType === 'bubble'
      ? processRawBubblesData(
          (rawPromise.value.rawMarkersData as StandaloneMapBubblesResponse)
            .mapElements,
          (props.overlayConfig as BubbleOverlayConfig | undefined)
            ?.aggregationConfig,
          bubbleValueToDiameterMapper,
          bubbleValueToColorMapper
        )
      : processRawMarkersData(
          (rawPromise.value.rawMarkersData as StandaloneMapMarkersResponse)
            .mapElements,
          markerType,
          defaultDependentAxisRange,
          dependentAxisLogScale,
          vocabulary,
          overlayType
        );
  }, [
    bubbleValueToColorMapper,
    bubbleValueToDiameterMapper,
    defaultDependentAxisRange,
    dependentAxisLogScale,
    markerType,
    overlayType,
    props.overlayConfig,
    rawPromise.value,
    vocabulary,
  ]);

  /**
   * create custom legend data
   */
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const vocabulary = rawPromise?.value?.vocabulary;
    if (vocabulary == null || markerType === 'bubble') return [];

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
        ? some(
            rawPromise.value.rawMarkersData.mapElements,
            (el) =>
              // TS says el could potentially be a number, and I don't know why
              typeof el === 'object' &&
              'overlayValues' in el &&
              el.overlayValues.some((ov) => ov.binLabel === label)
          )
        : false,
      group: 1,
      rank: 1,
    }));
  }, [markerType, overlayType, rawPromise]);

  return {
    markersData: finalMarkersData as MapMarkers['markersData'],
    totalVisibleWithOverlayEntityCount: countSum,
    totalVisibleEntityCount,
    legendItems,
    bubbleLegendData: adjustedBubbleLegendData,
    bubbleValueToDiameterMapper,
    bubbleValueToColorMapper,
    pending: rawPromise.pending,
    error: rawPromise.error,
  };
}

const processRawMarkersData = (
  mapElements: StandaloneMapMarkersResponse['mapElements'],
  markerType: 'count' | 'proportion' | 'pie',
  defaultDependentAxisRange: NumberRange,
  dependentAxisLogScale: boolean,
  vocabulary?: string[],
  overlayType?: 'categorical' | 'continuous'
) => {
  return mapElements.map(
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
      const { bounds, position } = getBoundsAndPosition(
        minLat,
        minLon,
        maxLat,
        maxLon,
        avgLat,
        avgLon
      );

      const donutData =
        vocabulary && overlayValues && overlayValues.length
          ? overlayValues.map(({ binLabel, value, count }) => ({
              label: binLabel,
              value,
              count,
              color:
                overlayType === 'categorical'
                  ? ColorPaletteDefault[vocabulary.indexOf(binLabel)]
                  : gradientSequentialColorscaleMap(
                      vocabulary.length > 1
                        ? vocabulary.indexOf(binLabel) / (vocabulary.length - 1)
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
                  count: 0,
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
        vocabulary != null && overlayValues // if there's an overlay (all expected use cases)
          ? overlayValues
              .filter(({ binLabel }) => vocabulary.includes(binLabel))
              .reduce((sum, { count }) => (sum = sum + count), 0)
          : entityCount; // fallback if not

      const commonMarkerProps = {
        data: reorderedData,
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
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
};

const processRawBubblesData = (
  mapElements: StandaloneMapBubblesResponse['mapElements'],
  aggregationConfig?: BubbleOverlayConfig['aggregationConfig'],
  bubbleValueToDiameterMapper?: (value: number) => number,
  bubbleValueToColorMapper?: (value: number) => string
) => {
  return mapElements.map(
    ({
      geoAggregateValue,
      entityCount,
      avgLat,
      avgLon,
      minLat,
      minLon,
      maxLat,
      maxLon,
      overlayValue,
    }) => {
      const { bounds, position } = getBoundsAndPosition(
        minLat,
        minLon,
        maxLat,
        maxLon,
        avgLat,
        avgLon
      );

      // TO DO: address diverging colorscale (especially if there are use-cases)

      const bubbleData = {
        value: entityCount,
        diameter: bubbleValueToDiameterMapper?.(entityCount) ?? 0,
        colorValue: overlayValue,
        colorLabel: aggregationConfig
          ? aggregationConfig.overlayType === 'continuous'
            ? _.capitalize(aggregationConfig.aggregator)
            : 'Proportion'
          : undefined,
        color: bubbleValueToColorMapper?.(overlayValue),
      };

      return {
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
        duration: defaultAnimationDuration,
        data: bubbleData,
        markerLabel: String(entityCount),
      } as BubbleMarkerProps;
    }
  );
};

const getBoundsAndPosition = (
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number,
  avgLat: number,
  avgLon: number
) => ({
  bounds: {
    southWest: { lat: minLat, lng: minLon },
    northEast: { lat: maxLat, lng: maxLon },
  },
  position: { lat: avgLat, lng: avgLon },
});

function fixLabelForOtherValues(input: string): string {
  return input === UNSELECTED_TOKEN ? UNSELECTED_DISPLAY_TEXT : input;
}
