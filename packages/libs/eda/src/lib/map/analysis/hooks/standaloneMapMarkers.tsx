import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';
import { ReactElement, useCallback, useMemo } from 'react';
import { usePromise } from '../../../core/hooks/promise';
import {
  BoundsViewport,
  Bounds,
  LatLng,
} from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../core/types/geoConfig';
import { StudyEntity, Variable } from '../../../core/types/study';
import DataClient, {
  CompleteCasesTable,
  MapMarkersOverlayRequestParams,
  MapMarkersOverlayResponse,
  MapMarkersRequestParams,
  StandaloneMapMarkersRequestParams,
  StandaloneMapMarkersResponse,
} from '../../../core/api/DataClient';
import { Filter } from '../../../core/types/filter';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
} from '../../../core/hooks/workspace';
import { NumberRange } from '../../../core/types/general';
import { useDefaultAxisRange } from '../../../core/hooks/computeDefaultAxisRange';
import { zip, sum, values, some } from 'lodash';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots';
import DonutMarker from '@veupathdb/components/lib/map/DonutMarker';
import ChartMarker from '@veupathdb/components/lib/map/ChartMarker';
import {
  kFormatter,
  mFormatter,
} from '../../../core/utils/big-number-formatters';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { VariableDescriptor } from '../../../core/types/variable';
import { leastAncestralEntity } from '../../../core/utils/data-element-constraints';

/**
 * Provides markers for use in the MapVEuMap component
 * Also provides associated data (stats, legend items), pending status and back end errors.
 *
 */

export interface StandaloneMapMarkersProps {
  boundsZoomLevel: BoundsViewport | undefined;
  //vizConfig: MapConfig;
  geoConfig: GeoConfig | undefined;
  studyId: string;
  filters: Filter[] | undefined;
  computationType: string;
  overlayVariable: VariableDescriptor | undefined; // formerly xAxisVariable in older EDA viz
  markerType: 'count' | 'proportion' | 'pie';
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
  overlayVariable: Variable | undefined; // formerly xAxisVariable in older EDA visualizations
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
    studyId,
    filters,
    computationType,
    overlayVariable,
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
    overlayVariableAndEntity,
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

    const overlayVariableAndEntity = findEntityAndVariable(overlayVariable);
    // output entity needs to be the least ancestral of the two entities (if both are non-null)
    const outputEntity = overlayVariableAndEntity?.entity
      ? leastAncestralEntity(
          [overlayVariableAndEntity.entity, geoConfig.entity],
          entities
        )
      : geoConfig.entity;

    return {
      latitudeVariable,
      longitudeVariable,
      geoAggregateVariable,
      outputEntity,
      overlayVariableAndEntity,
      findEntityAndVariable,
    };
  }, [boundsZoomLevel, geoConfig, overlayVariable]);

  const markerData = usePromise<StandaloneMapMarkersResponse | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        geoConfig == null ||
        latitudeVariable == null ||
        longitudeVariable == null ||
        geoAggregateVariable == null ||
        outputEntity == null
      )
        return undefined;

      const {
        northEast: { lat: xMax, lng: right },
        southWest: { lat: xMin, lng: left },
      } = boundsZoomLevel.bounds;

      // now prepare the rest of the request params
      const requestParams: StandaloneMapMarkersRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          outputEntityId: outputEntity.id,
          geoAggregateVariable,
          latitudeVariable,
          longitudeVariable,
          ...(overlayVariable != null
            ? {
                overlayConfig: {
                  overlayType: 'categorical',
                  overlayVariable: overlayVariable,
                },
              }
            : {}),
          valueSpec: 'count', // TO DO: or proportion!
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
      const response = await dataClient.getStandaloneMapMarkers(
        computationType,
        requestParams
      );

      return response;

      //      return {
      //        markerData: response.mapElements.map(
      //          ({
      //            avgLat,
      //            avgLon,
      //            minLat,
      //            minLon,
      //            maxLat,
      //            maxLon,
      //            entityCount,
      //            geoAggregateValue,
      //          }) => {
      //            const isAtomic = false; // TO DO: work with Danielle to get this info from back end
      //            return {
      //              geoAggregateValue,
      //              entityCount: entityCount,
      //              position: { lat: avgLat, lng: avgLon },
      //              bounds: {
      //                southWest: { lat: minLat, lng: minLon },
      //                northEast: { lat: maxLat, lng: maxLon },
      //              },
      //              isAtomic,
      //            };
      //          }
      //        ),
      //      };
    }, [
      studyId,
      filters,
      dataClient,
      overlayVariable,
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      outputEntity,
      boundsZoomLevel,
      computationType,
      geoConfig,
    ])
  );

  const proportionMode = markerType === 'proportion';

  const totalVisibleEntityCount: number | undefined =
    markerData.value?.mapElements.reduce((acc, curr) => {
      return acc + curr.entityCount;
    }, 0);

  // calculate minPos, max and sum for chart marker dependent axis
  const { valueMax, valueMinPos, valueSum } = useMemo(
    () =>
      markerData.value
        ? markerData.value.mapElements
            .flatMap((el) => el.overlayValues)
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
    [markerData]
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
    return markerData.value?.mapElements.map(
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
          overlayValues && overlayValues.length
            ? overlayValues.map((ov) => ({
                label: ov.binLabel,
                value: ov.value,
                color: 'purple',
              }))
            : [{ label: 'none', value: 100, color: 'orange' }]; // TO DO: sort out!

        // TO DO: sort out colorscale / palette

        // now reorder the data, adding zeroes if necessary.
        const reorderedData = donutData;

        //          vocabulary != null
        //            ? vocabulary.map(
        //                (
        //                  overlayLabel // overlay label can be 'female' or a bin label '(0,100]'
        //                ) =>
        //                  donutData.find(({ label }) => label === overlayLabel) ?? {
        //                    label: overlayLabel,
        //                    value: 0,
        //                  }
        //              )
        //            : // however, if there is no overlay data
        //              // provide a simple entity count marker in the palette's first colour
        //              [
        //                {
        //                  label: 'unknown',
        //                  value: entityCount,
        //                  color: ColorPaletteDefault[0],
        //                },
        //              ];

        const MarkerComponent =
          markerType == null || markerType === 'pie'
            ? DonutMarker
            : ChartMarker;

        const count = entityCount;
        // TO DO: resurrect this...
        //          overlayData != null
        //            ? markerType == null || markerType === 'pie'
        //              ? // pies always show sum of legend checked items (donutData is already filtered on checkboxes)
        //                donutData.reduce((sum, item) => (sum = sum + item.value), 0)
        //              : // the bar/histogram charts always show the constant entity count
        //                // however, if there is no data at all we can safely infer a zero
        //
        //                // TO DO/WARNING: for (literal) edge cases in proportion mode
        //                // this is buggy - see explanation here
        //                // https://github.com/VEuPathDB/web-eda/issues/1674 (the bit about viewport)
        //                // wait for new back end before addressing it
        //
        //                overlayData[geoAggregateValue]?.entityCount ?? 0
        //            : entityCount;

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
    markerData.value,
    checkedLegendItems,
    markerType,
    overlayVariable,
    outputEntity,
    dependentAxisLogScale,
  ]);

  /**
   * create custom legend data
   */

  const legendItems: LegendItemsProps[] = [];

  //  useMemo(() => {
  //    if (vocabulary == null) return [];
  //
  //    return vocabulary.map((label) => ({
  //      label,
  //      marker: 'square',
  //      markerColor:
  //        xAxisVariableType === 'string'
  //          ? ColorPaletteDefault[vocabulary.indexOf(label)]
  //          : gradientSequentialColorscaleMap(
  //              vocabulary.indexOf(label) / (vocabulary.length - 1)
  //            ),
  //      // has any geo-facet got an array of overlay data
  //      // containing at least one element that satisfies label==label
  //      // (do not check that value > 0, because the back end doesn't return
  //      // zero counts, but does sometimes return near-zero counts that get
  //      // rounded to zero)
  //      hasData: overlayData
  //        ? some(overlayData, (pieData) =>
  //            some(pieData.data, (data) => data.label === label)
  //          )
  //        : false,
  //      group: 1,
  //      rank: 1,
  //    }));
  //  }, [xAxisVariable, vocabulary, overlayData]);

  return {
    markers,
    overlayVariable: overlayVariableAndEntity?.variable,
    outputEntity,
    totalVisibleWithOverlayEntityCount: valueSum ?? totalVisibleEntityCount,
    totalVisibleEntityCount,
    //    vocabulary,
    legendItems,
    pending: markerData.pending,
    error: markerData.error,
  };
}
