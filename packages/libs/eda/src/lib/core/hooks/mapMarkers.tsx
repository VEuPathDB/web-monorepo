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
import { NumberVariable, StudyEntity, Variable } from '../types/study';
import DataClient, {
  CompleteCasesTable,
  MapMarkersOverlayRequestParams,
  MapMarkersOverlayResponse,
  MapMarkersRequestParams,
} from '../api/DataClient';
import { Filter } from '../types/filter';
import { useDataClient } from './workspace';
import { Computation } from '../types/visualization';
import { BinSpec, NumberRange } from '../types/general';
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
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotLegend';

// TO DO: move to configuration somewhere?
const numContinuousBins = 8;

/**
 * Provides markers for use in the MapVEuMap component
 * Also provides associated data (stats, legend items), pending status and back end errors.
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
  boundsZoomLevel: BoundsViewport | undefined;
  vizConfig: MapConfig;
  geoConfig: GeoConfig | undefined;
  outputEntity: StudyEntity | undefined;
  studyId: string;
  filters: Filter[] | undefined;
  computation: Computation;
  xAxisVariable: Variable | undefined;
}

// what this hook returns
interface MapMarkers {
  /** the markers */
  markers: ReactElement<BoundsDriftMarkerProps>[] | undefined;
  /** various stats for birds eye etc */
  totalEntityCount: number | undefined;
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
    boundsZoomLevel,
    vizConfig,
    geoConfig,
    outputEntity,
    studyId,
    filters,
    computation,
    xAxisVariable,
  } = props;

  const dataClient: DataClient = useDataClient();

  // prepare some info that the map-markers and overlay requests both need
  const {
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
  } = useMemo(() => {
    if (
      boundsZoomLevel == null ||
      geoConfig == null ||
      vizConfig.geoEntityId == null
    )
      return {};

    const latitudeVariable = {
      entityId: vizConfig.geoEntityId,
      variableId: geoConfig.latitudeVariableId,
    };
    const longitudeVariable = {
      entityId: vizConfig.geoEntityId,
      variableId: geoConfig.longitudeVariableId,
    };
    const geoAggregateVariable = {
      entityId: vizConfig.geoEntityId,
      variableId:
        geoConfig.aggregationVariableIds[
          geoConfig.zoomLevelToAggregationLevel(boundsZoomLevel.zoomLevel) - 1
        ],
    };

    return {
      latitudeVariable,
      longitudeVariable,
      geoAggregateVariable,
    };
  }, [boundsZoomLevel, vizConfig.geoEntityId, geoConfig]);

  // now do the first request
  const basicMarkerData = usePromise<BasicMarkerData | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        vizConfig.geoEntityId == null ||
        geoConfig == null ||
        latitudeVariable == null ||
        longitudeVariable == null ||
        geoAggregateVariable == null ||
        outputEntity == null ||
        vizConfig.xAxisVariable == null
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
        computation.descriptor.type,
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
      vizConfig.geoEntityId,
      vizConfig.xAxisVariable,
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      outputEntity,
      boundsZoomLevel,
      computation.descriptor.type,
      geoConfig,
    ])
  );

  const totalEntityCount = basicMarkerData.value?.completeCasesGeoVar;

  /**
   * Now get the overlay data
   */

  const defaultOverlayRange = useDefaultAxisRange(xAxisVariable);
  const proportionMode = vizConfig.markerType === 'proportion';

  const overlayResponse = usePromise<MapMarkersOverlayResponse | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        vizConfig.xAxisVariable == null ||
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

      // For now, just calculate a static binSpec from variable metadata for numeric continous only
      // TO DO: date variables when we have testable data (UMSP has them but difficult to test, and back end was giving 500s)
      // date variables need special date maths for calculating the width, and probably rounding aggressively to whole months/years etc - not trivial.
      const binSpec: BinSpec | undefined =
        NumberVariable.is(xAxisVariable) &&
        defaultOverlayRange != null &&
        NumberRange.is(defaultOverlayRange)
          ? {
              range: defaultOverlayRange,
              type: 'binWidth',
              value:
                (defaultOverlayRange.max - defaultOverlayRange.min) /
                numContinuousBins,
            }
          : // : DateVariable.is(xAxisVariable) && DateRange.is(defaultOverlayRange) ? ... TO DO
            undefined;

      // prepare request
      const requestParams: MapMarkersOverlayRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          outputEntityId: outputEntity.id,
          xAxisVariable: vizConfig.xAxisVariable,
          latitudeVariable: latitudeVariable,
          longitudeVariable: longitudeVariable,
          geoAggregateVariable: geoAggregateVariable,
          showMissingness: 'noVariables', // current back end 'showMissing' behaviour applies to facet variable
          valueSpec: proportionMode ? 'proportion' : 'count',
          binSpec: binSpec ?? {},
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
        computation.descriptor.type,
        requestParams
      );
    }, [
      studyId,
      dataClient,
      xAxisVariable,
      vizConfig.xAxisVariable,
      proportionMode,
      boundsZoomLevel,
      computation.descriptor.type,
      geoAggregateVariable,
      outputEntity,
      filters,
    ])
  );

  // If it's a string variable and a small vocabulary, use it as-is from the study metadata.
  // This ensures that for low cardinality categoricals, the colours are always the same.
  // Otherwise use the overlayValues from the back end (which are either bins or a Top7+Other)
  const vocabulary =
    xAxisVariable?.type === 'string' &&
    xAxisVariable?.vocabulary != null &&
    xAxisVariable.vocabulary.length <= 8
      ? xAxisVariable.vocabulary
      : overlayResponse.value?.mapMarkers.config.overlayValues;

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

  // calculate minPos and max for chart marker dependent axis
  const valueMax = useMemo(
    () =>
      overlayData
        ? values(overlayData) // it's a Record 'object'
            .map((record) => record.data)
            .flat() // flatten all the arrays into one
            .reduce(
              (accum, elem) => (elem.value > accum ? elem.value : accum),
              0
            ) // find max value
        : 0,
    [overlayData]
  );

  const valueMinPos = useMemo(
    () =>
      overlayData
        ? values(overlayData)
            .map((record) => record.data)
            .flat()
            .reduce<number | undefined>(
              (accum, elem) =>
                elem.value > 0 && (accum == null || elem.value < accum)
                  ? elem.value
                  : accum,
              undefined
            )
        : undefined,
    [overlayData]
  );

  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    vizConfig.dependentAxisLogScale
  ) as NumberRange;

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const markers = useMemo(() => {
    if (vocabulary == null) return undefined;

    return basicMarkerData.value?.markerData.map(
      ({ geoAggregateValue, entityCount, bounds, position }) => {
        const donutData =
          overlayData?.[geoAggregateValue] != null
            ? overlayData[geoAggregateValue].data
                .map(({ label, value }) => ({
                  label,
                  value,
                  color:
                    xAxisVariable?.type === 'string'
                      ? ColorPaletteDefault[vocabulary.indexOf(label!)]
                      : gradientSequentialColorscaleMap(
                          vocabulary.indexOf(label!) / (vocabulary.length - 1)
                        ),
                }))
                // DonutMarkers don't handle checkedLegendItems automatically, like our
                // regular PlotlyPlot components, so we do the filtering here
                .filter(
                  ({ label }) =>
                    vizConfig.checkedLegendItems == null ||
                    vizConfig.checkedLegendItems.indexOf(label) > -1
                )
            : [];

        // now reorder the data, adding zeroes if necessary.
        const reorderedData = vocabulary.map(
          (
            overlayLabel // overlay label can be 'female' or a bin label '(0,100]'
          ) =>
            donutData.find(({ label }) => label === overlayLabel) ?? {
              label: overlayLabel,
              value: 0,
            }
        );

        // provide the 'plain white' donut data if all legend items unchecked
        // or if there is no overlay data
        const safeDonutData =
          reorderedData.length > 0
            ? reorderedData
            : [
                {
                  label: 'unknown',
                  value: entityCount,
                  color: 'white',
                },
              ];

        // TO DO: find out if MarkerProps.id is obsolete
        const MarkerComponent =
          vizConfig.markerType == null || vizConfig.markerType === 'pie'
            ? DonutMarker
            : ChartMarker;

        const count =
          overlayData != null
            ? vizConfig.markerType == null || vizConfig.markerType === 'pie'
              ? // pies always show sum of legend checked items (donutData is already filtered on checkboxes)
                donutData.reduce((sum, item) => (sum = sum + item.value), 0)
              : // the bar/histogram charts always show the constant entity count
                // however, if there is no data at all we can safely infer a zero
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
            data={safeDonutData}
            duration={defaultAnimationDuration}
            markerLabel={formattedCount}
            {...(vizConfig.markerType !== 'pie'
              ? {
                  dependentAxisRange: defaultDependentAxisRange,
                  dependentAxisLogScale: vizConfig.dependentAxisLogScale,
                }
              : {})}
          />
        );
      }
    );
  }, [
    basicMarkerData.value,
    vocabulary,
    overlayData,
    vizConfig.checkedLegendItems,
    vizConfig.markerType,
    xAxisVariable,
    outputEntity,
    // add vizConfig.dependentAxisLogScale to reflect its state change
    vizConfig.dependentAxisLogScale,
  ]);

  /**
   * create custom legend data
   */

  const legendItems: LegendItemsProps[] = useMemo(() => {
    if (vocabulary == null) return [];

    return vocabulary.map((label) => ({
      label,
      marker: 'square',
      markerColor:
        xAxisVariable?.type === 'string'
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
    }));
  }, [xAxisVariable, vocabulary, overlayData]);

  return {
    markers,
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
