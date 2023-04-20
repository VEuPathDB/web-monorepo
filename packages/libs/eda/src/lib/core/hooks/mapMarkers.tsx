import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';
import { ReactElement, useCallback, useMemo } from 'react';
import { usePromise } from './promise';
import {
  BoundsViewport,
  Bounds,
  LatLng,
} from '@veupathdb/components/lib/map/Types';
import { MapConfig } from '../components/visualizations/implementations/MapVisualization';
import { GeoConfig } from '../types/geoConfig';
import { StudyEntity, Variable } from '../types/study';
import DataClient, {
  CompleteCasesTable,
  MapMarkersOverlayRequestParams,
  MapMarkersOverlayResponse,
  MapMarkersRequestParams,
} from '../api/DataClient';
import { Filter } from '../types/filter';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
} from './workspace';
import { NumberRange } from '../types/general';
import { useDefaultAxisRange } from './computeDefaultAxisRange';
import { zip, sum, values, some } from 'lodash';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots';
import DonutMarker from '@veupathdb/components/lib/map/DonutMarker';
import ChartMarker from '@veupathdb/components/lib/map/ChartMarker';
import { kFormatter, mFormatter } from '../utils/big-number-formatters';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { VariableDescriptor } from '../types/variable';
import { leastAncestralEntity } from '../utils/data-element-constraints';

/**
 * Provides markers for use in the MapVEuMap component
 * Also provides associated data (stats, legend items), pending status and back end errors.
 *
 * The "overlay variable" is actually the "xAxisVariable" and the two terms are used
 * interchangably.
 */

type BasicMarkerData = {
  completeCasesGeoVar: number;
  markerData: {
    geoAggregateValue: string;
    entityCount: number;
    position: LatLng;
    bounds: Bounds;
    isAtomic: boolean;
  }[];
};

type MapMarkersOverlayData = Record<
  string,
  { entityCount: number; data: { label: string; value: number }[] }
>;

export interface MapMarkersProps {
  /**
   * if requireOverlay is true, only return markers when an overlay variable (xAxisVariable)
   * has been provided (as is behaviour desired for the map viz),
   * otherwise, basic "count only" markers will be shown (full screen behaviour)
   */
  requireOverlay: boolean;
  boundsZoomLevel: BoundsViewport | undefined;
  //vizConfig: MapConfig;
  geoConfig: GeoConfig | undefined;
  studyId: string;
  filters: Filter[] | undefined;
  computationType: string;
  xAxisVariable: VariableDescriptor | undefined;
  markerType: MapConfig['markerType'];
  dependentAxisLogScale?: boolean;
  /** checked legend items - or undefined if not known */
  // TO DO: disable checkbox functionality everywhere for map markers and their legends?
  checkedLegendItems?: string[];
  /** mini markers - default = false */
  miniMarkers?: boolean;
  /** invisible markers (special use case related to minimap fly-to) - default = false */
  invisibleMarkers?: boolean;
}

// what this hook returns
interface MapMarkers {
  /** the markers */
  markers: ReactElement<BoundsDriftMarkerProps>[] | undefined;
  /** what the output entity is */
  outputEntity: StudyEntity | undefined;
  /** the full xAxisVariable object */
  xAxisVariable: Variable | undefined;
  /** various stats for birds eye etc */
  totalEntityCount: number | undefined;
  /** If `totalEntityCount` tells you how many entites there are, `totalVisibleEntityCount` tells you how many entities are visible at a given viewport. But not necessarily with data for the overlay variable. */
  totalVisibleEntityCount: number | undefined;
  /** This tells you how many entities are on screen that also have data for the overlay variable
   * if there is one, otherwise it defaults to the totalVisibleEntityCount.
   * This number should always be the sum of the numbers in the center of the markers (assuming no checkboxes unchecked). */
  totalVisibleWithOverlayEntityCount: number | undefined;
  completeCasesAllVars: number | undefined;
  completeCases: CompleteCasesTable | undefined;
  /** the possible values for the overlay variable (e.g. back-end derived bin labels) */
  vocabulary: string[] | undefined;
  /** data for creating a legend */
  legendItems: LegendItemsProps[];
  /** are any requests still pending */
  pending: boolean;
  /** errors from the basic request */
  basicMarkerError: unknown;
  /** errors from the overlay request */
  overlayError: unknown;
}

export function useMapMarkers(props: MapMarkersProps): MapMarkers {
  const {
    requireOverlay,
    boundsZoomLevel,
    geoConfig,
    studyId,
    filters,
    computationType,
    xAxisVariable,
    markerType,
    dependentAxisLogScale = false,
    checkedLegendItems = undefined,
    miniMarkers = false,
    invisibleMarkers = false,
  } = props;

  const dataClient: DataClient = useDataClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const entities = useStudyEntities();

  // prepare some info that the map-markers and overlay requests both need
  const {
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    outputEntity,
    xAxisVariableAndEntity,
  } = useMemo(() => {
    if (
      boundsZoomLevel == null ||
      geoConfig == null ||
      geoConfig.entity.id == null
    )
      return {};

    const latitudeVariable = {
      entityId: geoConfig.entity.id,
      variableId: geoConfig.latitudeVariableId,
    };
    const longitudeVariable = {
      entityId: geoConfig.entity.id,
      variableId: geoConfig.longitudeVariableId,
    };
    const geoAggregateVariable = {
      entityId: geoConfig.entity.id,
      variableId:
        geoConfig.aggregationVariableIds[
          geoConfig.zoomLevelToAggregationLevel(boundsZoomLevel.zoomLevel) - 1
        ],
    };

    const xAxisVariableAndEntity = findEntityAndVariable(xAxisVariable);
    // output entity needs to be the least ancestral of the two entities (if both are non-null)
    const outputEntity = xAxisVariableAndEntity?.entity
      ? leastAncestralEntity(
          [xAxisVariableAndEntity.entity, geoConfig.entity],
          entities
        )
      : geoConfig.entity;

    return {
      latitudeVariable,
      longitudeVariable,
      geoAggregateVariable,
      outputEntity,
      xAxisVariableAndEntity,
      findEntityAndVariable,
    };
  }, [boundsZoomLevel, geoConfig, xAxisVariable]);

  // now do the first request
  const basicMarkerData = usePromise<BasicMarkerData | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        geoConfig == null ||
        latitudeVariable == null ||
        longitudeVariable == null ||
        geoAggregateVariable == null ||
        outputEntity == null ||
        (requireOverlay && xAxisVariable == null)
      )
        return undefined;

      const {
        northEast: { lat: xMax, lng: right },
        southWest: { lat: xMin, lng: left },
      } = boundsZoomLevel.bounds;

      // now prepare the rest of the request params
      const requestParams: MapMarkersRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          outputEntityId: outputEntity.id, // might be quicker to use geoEntity.id but numbers in white markers will be wrong, momentarily
          geoAggregateVariable,
          latitudeVariable,
          longitudeVariable,
          viewport: {
            latitude: {
              xMin,
              xMax,
            },
            longitude: {
              left,
              right,
            },
          },
        },
      };

      // now get the data
      const response = await dataClient.getMapMarkers(
        computationType,
        requestParams
      );

      return {
        markerData: response.mapElements.map(
          ({
            avgLat,
            avgLon,
            minLat,
            minLon,
            maxLat,
            maxLon,
            entityCount,
            geoAggregateValue,
          }) => {
            const isAtomic = false; // TO DO: work with Danielle to get this info from back end
            return {
              geoAggregateValue,
              entityCount: entityCount,
              position: { lat: avgLat, lng: avgLon },
              bounds: {
                southWest: { lat: minLat, lng: minLon },
                northEast: { lat: maxLat, lng: maxLon },
              },
              isAtomic,
            };
          }
        ),
        completeCasesGeoVar: response.config.completeCasesGeoVar,
      };
    }, [
      studyId,
      filters,
      dataClient,
      // we don't want to allow vizConfig.mapCenterAndZoom to trigger an update,
      // because boundsZoomLevel does the same thing, but they can trigger two separate updates
      // (baseLayer doesn't matter either) - so we cherry pick properties of vizConfig
      xAxisVariable,
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      outputEntity,
      boundsZoomLevel,
      computationType,
      geoConfig,
      requireOverlay,
    ])
  );

  const totalEntityCount = basicMarkerData.value?.completeCasesGeoVar;

  const totalVisibleEntityCount: number | undefined =
    basicMarkerData.value?.markerData.reduce((acc, curr) => {
      return acc + curr.entityCount;
    }, 0);

  /**
   * Now get the overlay data
   */

  const proportionMode = markerType === 'proportion';

  const overlayResponse = usePromise<MapMarkersOverlayResponse | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        xAxisVariable == null ||
        geoAggregateVariable == null ||
        outputEntity == null ||
        latitudeVariable == undefined ||
        longitudeVariable == undefined
      )
        return undefined;

      const {
        northEast: { lat: xMax, lng: right },
        southWest: { lat: xMin, lng: left },
      } = boundsZoomLevel.bounds;

      // prepare request
      const requestParams: MapMarkersOverlayRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          outputEntityId: outputEntity.id,
          xAxisVariable: xAxisVariable,
          latitudeVariable: latitudeVariable,
          longitudeVariable: longitudeVariable,
          geoAggregateVariable: geoAggregateVariable,
          showMissingness: 'noVariables', // current back end 'showMissing' behaviour applies to facet variable
          valueSpec: proportionMode ? 'proportion' : 'count',
          viewport: {
            latitude: {
              xMin,
              xMax,
            },
            longitude: {
              left,
              right,
            },
          },
        },
      };

      // send request
      return await dataClient.getMapMarkersOverlay(
        computationType,
        requestParams
      );
    }, [
      studyId,
      dataClient,
      xAxisVariable,
      proportionMode,
      boundsZoomLevel,
      computationType,
      geoAggregateVariable,
      outputEntity,
      filters,
      xAxisVariableAndEntity,
    ])
  );

  // If it's a string variable and a small vocabulary, use it as-is from the study metadata.
  // This ensures that for low cardinality categoricals, the colours are always the same.
  // Otherwise use the overlayValues from the back end (which are either bins or a Top7+Other)
  const xAxisVariableType = xAxisVariableAndEntity?.variable.type;
  const vocabulary = xAxisVariableAndEntity?.variable.vocabulary;

  const completeCasesAllVars =
    overlayResponse.value?.mapMarkers.config.completeCasesAllVars;
  const completeCases = overlayResponse.value?.completeCasesTable;

  const overlayData = useMemo(() => {
    // process response and return a map of "geoAgg key" => donut labels and counts
    return !overlayResponse.pending && overlayResponse.value
      ? overlayResponse.value.mapMarkers.data.reduce(
          (map, { geoAggregateVariableDetails, label, value }) => {
            const geoAggKey = geoAggregateVariableDetails.value;
            if (overlayResponse.value)
              // don't know why TS makes us do this check *again*...
              map[geoAggKey] = {
                // sum up the entity count from the sampleSizeTable because
                // the data.label values might be proportions (and sum to 1)
                // SEE 'WARNING' BELOW ABOUT THIS BEING INCORRECT
                entityCount: sum(
                  overlayResponse.value.sampleSizeTable.find(
                    (item) =>
                      item.geoAggregateVariableDetails != null &&
                      item.geoAggregateVariableDetails.value === geoAggKey
                  )?.size
                ),
                data: zip(label, value).map(([label, value]) => ({
                  label: label!,
                  value: value!,
                })),
              };
            return map;
          },
          {} as MapMarkersOverlayData
        )
      : undefined;
  }, [overlayResponse]);

  // calculate minPos, max and sum for chart marker dependent axis
  const { valueMax, valueMinPos, valueSum } = useMemo(
    () =>
      overlayData
        ? values(overlayData) // it's a Record 'object'
            .map((record) => record.data)
            .flat() // flatten all the arrays into one
            .reduce(
              ({ valueMax, valueMinPos, valueSum }, elem) => ({
                valueMax: elem.value > valueMax ? elem.value : valueMax,
                valueMinPos:
                  elem.value > 0 &&
                  (valueMinPos == null || elem.value < valueMinPos)
                    ? elem.value
                    : valueMinPos,
                valueSum: valueSum + elem.value,
              }),
              {
                valueMax: 0,
                valueMinPos: undefined as number | undefined,
                valueSum: 0,
              }
            )
        : { valueMax: 0, valueMinPos: undefined, valueSum: 0 },
    [overlayData]
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
  const markers = useMemo(() => {
    return basicMarkerData.value?.markerData.map(
      ({ geoAggregateValue, entityCount, bounds, position }) => {
        const donutData =
          vocabulary != null && overlayData?.[geoAggregateValue] != null
            ? overlayData[geoAggregateValue].data
                .map(({ label, value }) => ({
                  label,
                  value,
                  color:
                    xAxisVariableType === 'string'
                      ? ColorPaletteDefault[vocabulary.indexOf(label!)]
                      : gradientSequentialColorscaleMap(
                          vocabulary.indexOf(label!) / (vocabulary.length - 1)
                        ),
                }))
                // DonutMarkers don't handle checkedLegendItems automatically, like our
                // regular PlotlyPlot components, so we do the filtering here
                .filter(
                  ({ label }) =>
                    checkedLegendItems == null ||
                    checkedLegendItems.indexOf(label) > -1
                )
            : [];

        // now reorder the data, adding zeroes if necessary.
        const reorderedData =
          vocabulary != null
            ? vocabulary.map(
                (
                  overlayLabel // overlay label can be 'female' or a bin label '(0,100]'
                ) =>
                  donutData.find(({ label }) => label === overlayLabel) ?? {
                    label: overlayLabel,
                    value: 0,
                  }
              )
            : // however, if there is no overlay data
              // provide a simple entity count marker in the palette's first colour
              [
                {
                  label: 'unknown',
                  value: entityCount,
                  color: ColorPaletteDefault[0],
                },
              ];

        const MarkerComponent =
          markerType == null || markerType === 'pie'
            ? DonutMarker
            : ChartMarker;

        const count =
          overlayData != null
            ? markerType == null || markerType === 'pie'
              ? // pies always show sum of legend checked items (donutData is already filtered on checkboxes)
                donutData.reduce((sum, item) => (sum = sum + item.value), 0)
              : // the bar/histogram charts always show the constant entity count
                // however, if there is no data at all we can safely infer a zero

                // TO DO/WARNING: for (literal) edge cases in proportion mode
                // this is buggy - see explanation here
                // https://github.com/VEuPathDB/web-eda/issues/1674 (the bit about viewport)
                // wait for new back end before addressing it

                overlayData[geoAggregateValue]?.entityCount ?? 0
            : entityCount;

        const formattedCount =
          MarkerComponent === ChartMarker
            ? mFormatter(count)
            : kFormatter(count);

        return (
          <MarkerComponent
            id={geoAggregateValue}
            key={geoAggregateValue}
            bounds={bounds}
            position={position}
            data={reorderedData}
            duration={defaultAnimationDuration}
            markerLabel={miniMarkers ? '' : formattedCount}
            {...(markerType !== 'pie'
              ? {
                  dependentAxisRange: defaultDependentAxisRange,
                  dependentAxisLogScale: dependentAxisLogScale,
                }
              : {})}
            {...(miniMarkers && !invisibleMarkers
              ? { markerScale: 0.5 }
              : invisibleMarkers
              ? { markerScale: 0 }
              : {})}
          />
        );
      }
    );
  }, [
    basicMarkerData.value,
    vocabulary,
    overlayData,
    checkedLegendItems,
    markerType,
    xAxisVariable,
    outputEntity,
    dependentAxisLogScale,
  ]);

  // calculate count per each overlay item
  const legendCounts = useMemo(() => {
    if (vocabulary == null) return undefined;
    return vocabulary.map((voc) => {
      /*  	return overlayResponse.reduce((acc,obj) => { */
      return !overlayResponse.pending && overlayResponse.value
        ? overlayResponse.value.mapMarkers.data.reduce((acc, obj) => {
            const index = obj.label.findIndex((el) => el === voc);
            const value = index >= 0 ? obj.value[index] : 0;
            return acc + value;
          }, 0)
        : undefined;
    });
  }, [vocabulary, overlayResponse]);

  /**
   * create custom legend data
   */

  const legendItems: LegendItemsProps[] = useMemo(() => {
    if (vocabulary == null) return [];

    return vocabulary.map((label, index) => ({
      label,
      marker: 'square',
      markerColor:
        xAxisVariableType === 'string'
          ? ColorPaletteDefault[vocabulary.indexOf(label)]
          : gradientSequentialColorscaleMap(
              vocabulary.indexOf(label) / (vocabulary.length - 1)
            ),
      // has any geo-facet got an array of overlay data
      // containing at least one element that satisfies label==label
      // (do not check that value > 0, because the back end doesn't return
      // zero counts, but does sometimes return near-zero counts that get
      // rounded to zero)
      hasData: overlayData
        ? some(overlayData, (pieData) =>
            some(pieData.data, (data) => data.label === label)
          )
        : false,
      group: 1,
      rank: 1,
      count: legendCounts != null ? legendCounts[index] : undefined,
    }));
  }, [xAxisVariable, vocabulary, overlayData]);

  return {
    markers,
    xAxisVariable: xAxisVariableAndEntity?.variable,
    outputEntity,
    totalVisibleWithOverlayEntityCount: valueSum ?? totalVisibleEntityCount,
    totalVisibleEntityCount,
    totalEntityCount,
    completeCasesAllVars,
    completeCases,
    vocabulary,
    legendItems,
    pending: basicMarkerData.pending || overlayResponse.pending,
    basicMarkerError: basicMarkerData.error,
    overlayError: overlayResponse.error,
  };
}
