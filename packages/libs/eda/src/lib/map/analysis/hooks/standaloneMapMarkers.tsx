import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';
import { ReactElement, useCallback, useMemo } from 'react';
import { usePromise } from '../../../core/hooks/promise';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../core/types/geoConfig';
import { StudyEntity, Variable } from '../../../core/types/study';
import DataClient, {
  BinRange,
  OverlayConfig,
  StandaloneMapMarkersRequestParams,
  StandaloneMapMarkersResponse,
} from '../../../core/api/DataClient';
import { Filter } from '../../../core/types/filter';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
  useSubsettingClient,
} from '../../../core/hooks/workspace';
import { NumberRange } from '../../../core/types/general';
import { useDefaultAxisRange } from '../../../core/hooks/computeDefaultAxisRange';
import { some } from 'lodash';
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
import { SubsettingClient } from '../../../core/api';

const TOKEN_UNSELECTED = '__UNSELECTED__';

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
    miniMarkers = false,
    invisibleMarkers = false,
  } = props;

  const dataClient: DataClient = useDataClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const entities = useStudyEntities();

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

  const { outputEntity, overlayVariableAndEntity } = useMemo(() => {
    if (geoConfig == null || geoConfig.entity.id == null) return {};

    const overlayVariableAndEntity = findEntityAndVariable(overlayVariable);
    // output entity needs to be the least ancestral of the two entities (if both are non-null)
    const outputEntity = overlayVariableAndEntity?.entity
      ? leastAncestralEntity(
          [overlayVariableAndEntity.entity, geoConfig.entity],
          entities
        )
      : geoConfig.entity;

    return {
      outputEntity,
      overlayVariableAndEntity,
    };
  }, [geoConfig, overlayVariable, entities]);

  // handle the geoAggregateVariable separately because it changes with zoom level
  // and we don't want that to change overlayVariableAndEntity etc because that invalidates
  // the overlayConfigPromise

  const geoAggregateVariable = useMemo(
    () =>
      geoConfig != null && boundsZoomLevel?.zoomLevel != null
        ? {
            entityId: geoConfig.entity.id,
            variableId:
              geoConfig.aggregationVariableIds[
                geoConfig.zoomLevelToAggregationLevel(
                  boundsZoomLevel?.zoomLevel
                ) - 1
              ],
          }
        : undefined,
    [boundsZoomLevel?.zoomLevel, geoConfig]
  );

  // determine the default overlayConfig (TO DO: allow user overrides)
  // this will require a call to the distribution endpoint for categoricals and the new endpoint for continuous
  const subsettingClient = useSubsettingClient();

  // So we bundle the overlayConfig and the outputEntity together in the usePromise payload. Why?
  // The issue is that when changing variables, the outputEntity changes instantaneously, while
  // the overlayConfig has to wait for a back end response. The great thing about usePromise is
  // that the previous value is kept until the new value is available.
  // If we bundle them together in the payload then, from the markerData fetch's perspective,
  // they will **change at the same time**.  If you don't do this, the instantaneous outputEntity
  // change triggers a back end request (which can fail because old-variable + new-entity can be illegal).
  // Then when the overlay variable data comes back, a second request is triggered with a consistent
  // payload of data.
  type MarkerVariableBundle = {
    outputEntityId: string;
    overlayConfig?: OverlayConfig;
  };

  const markerVariableBundlePromise = usePromise<
    MarkerVariableBundle | undefined
  >(
    useCallback(async () => {
      if (
        overlayVariableAndEntity != null &&
        overlayVariable != null &&
        outputEntity != null
      ) {
        const vocabulary = overlayVariableAndEntity.variable.vocabulary ?? [];

        if (vocabulary.length) {
          // categorical
          // If the variable has "too many" values, get the top 7 from the distribution service
          const overlayValues =
            vocabulary.length <= ColorPaletteDefault.length
              ? vocabulary
              : await getMostFrequentValues({
                  studyId: studyId,
                  ...overlayVariable,
                  numValues: ColorPaletteDefault.length - 1,
                  subsettingClient,
                });

          return {
            overlayConfig: {
              overlayType: 'categorical',
              overlayVariable,
              overlayValues,
            },
            outputEntityId: outputEntity.id,
          };
        } else {
          // continuous
          const overlayBins = await getBinRanges({
            studyId,
            filters: filters ?? [],
            ...overlayVariable,
            dataClient,
          });

          return {
            overlayConfig: {
              overlayType: 'continuous',
              overlayValues: overlayBins,
              overlayVariable,
            },
            outputEntityId: outputEntity.id,
          };
        }
      } else if (outputEntity != null) {
        return {
          outputEntityId: outputEntity.id,
        };
      } else {
        return undefined;
      }
    }, [
      overlayVariable,
      outputEntity,
      // categorical overlay config changes when the vocabulary changes,
      // while the continuous overlay is also filter-sensitive
      overlayVariableAndEntity?.variable.vocabulary ?? filters,
      studyId,
      subsettingClient,
    ])
  );

  const markerVariableBundle = markerVariableBundlePromise.value;
  const overlayType = markerVariableBundle?.overlayConfig?.overlayType;
  const vocabulary =
    overlayType === 'categorical' // switch statement style guide time!!
      ? markerVariableBundle?.overlayConfig?.overlayValues
      : overlayType === 'continuous'
      ? markerVariableBundle?.overlayConfig?.overlayValues.map(
          (ov) => ov.binLabel
        )
      : undefined;

  const markerData = usePromise<StandaloneMapMarkersResponse | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        geoConfig == null ||
        latitudeVariable == null ||
        longitudeVariable == null ||
        geoAggregateVariable == null ||
        markerVariableBundle?.outputEntityId == null
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
          geoAggregateVariable,
          latitudeVariable,
          longitudeVariable,
          ...markerVariableBundle, // also includes outputEntityId
          valueSpec: 'count', // TO DO: or proportion when we have the UI and back-end fix https://github.com/VEuPathDB/EdaDataService/issues/261 for this
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
      return await dataClient.getStandaloneMapMarkers(
        computationType,
        requestParams
      );
    }, [
      studyId,
      filters,
      dataClient,
      markerVariableBundle,
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      boundsZoomLevel,
      computationType,
      geoConfig,
    ])
  );

  const totalVisibleEntityCount: number | undefined =
    markerData.value?.mapElements.reduce((acc, curr) => {
      return acc + curr.entityCount;
    }, 0);

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
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
                valueSum: (valueSum ?? 0) + elem.value,
              }),
              {
                valueMax: 0,
                valueMinPos: undefined as number | undefined,
                valueSum: undefined as number | undefined,
              }
            )
        : { valueMax: undefined, valueMinPos: undefined, valueSum: undefined },
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
          vocabulary && overlayValues && overlayValues.length
            ? overlayValues.map(({ binLabel, value }) => ({
                label: binLabel,
                value: value,
                color:
                  overlayType === 'categorical'
                    ? ColorPaletteDefault[vocabulary.indexOf(binLabel)]
                    : gradientSequentialColorscaleMap(
                        vocabulary.indexOf(binLabel) / (vocabulary.length - 1)
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

        const MarkerComponent =
          markerType == null || markerType === 'pie'
            ? DonutMarker
            : ChartMarker;

        // TO DO: this will sum to 1 when we allow proportion mode
        // maybe ask for the counts to come along site the values in the back end response
        // https://github.com/VEuPathDB/EdaDataService/issues/261
        // (the way we did it in the old viz wasn't 100% accurate)
        const count = reorderedData.reduce(
          (sum, item) => (sum = sum + item.value),
          0
        );

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
    markerType,
    overlayVariable,
    outputEntity,
    dependentAxisLogScale,
  ]);

  /**
   * create custom legend data
   */

  const legendItems: LegendItemsProps[] = useMemo(() => {
    if (vocabulary == null) return [];

    return vocabulary.map((label) => ({
      label: fixLabelForOtherValues(label),
      marker: 'square',
      markerColor:
        overlayType === 'categorical'
          ? ColorPaletteDefault[vocabulary.indexOf(label)]
          : overlayType === 'continuous'
          ? gradientSequentialColorscaleMap(
              vocabulary.indexOf(label) / (vocabulary.length - 1)
            )
          : undefined,
      // has any geo-facet got an array of overlay data
      // containing at least one element that satisfies label==label
      hasData: markerData
        ? some(markerData.value?.mapElements, (el) =>
            el.overlayValues.some((ov) => ov.binLabel === label)
          )
        : false,
      group: 1,
      rank: 1,
    }));
  }, [markerData, vocabulary, overlayType]);

  return {
    markers,
    overlayVariable: overlayVariableAndEntity?.variable,
    outputEntity,
    totalVisibleWithOverlayEntityCount: valueSum,
    totalVisibleEntityCount,
    //    vocabulary,
    legendItems,
    pending: markerData.pending,
    error: markerData.error,
  };
}

type GetMostFrequentValuesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  numValues: number; // the N of the top N most frequent values
  subsettingClient: SubsettingClient;
};

// get the most frequent values for the entire dataset, no filters at all
// (for now at least)
async function getMostFrequentValues({
  studyId,
  variableId,
  entityId,
  numValues,
  subsettingClient,
}: GetMostFrequentValuesProps): Promise<string[]> {
  const distributionResponse = await subsettingClient.getDistribution(
    studyId,
    entityId,
    variableId,
    {
      valueSpec: 'count',
      filters: [],
    }
  );

  const sortedValues = distributionResponse.histogram
    .sort((bin1, bin2) => bin2.value - bin1.value)
    .map((bin) => bin.binLabel);
  if (sortedValues.length < numValues) {
    // console logging message because the throw didn't seem to bring up the usual dialogue on the screen
    // TO DO: understand/fix this
    const message =
      'standaloneMapMarkers: getMostFrequentValues was called for a low-cardinality variable';
    console.log({ message, sortedValues });
    throw new Error(message);
  }
  return [...sortedValues.slice(0, numValues), TOKEN_UNSELECTED];
}

type GetBinRangesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  dataClient: DataClient;
  filters: Filter[];
};

// get the equal spaced bin definitions (for now at least)
async function getBinRanges({
  studyId,
  variableId,
  entityId,
  dataClient,
  filters,
}: GetBinRangesProps): Promise<BinRange[]> {
  const response = await dataClient.getContinousVariableMetadata({
    studyId,
    filters,
    config: {
      variable: {
        entityId,
        variableId,
      },
      metadata: ['binRanges'],
    },
  });

  const binRanges = response.binRanges?.equalInterval!; // if asking for binRanges, the response WILL contain binRanges

  // TO DO: remove when it's fixed
  // minor processing to work-around https://github.com/VEuPathDB/plot.data/issues/219
  // ignore the `value: null` props in response
  return binRanges.map(({ binStart, binEnd, binLabel }, index) => ({
    binStart,
    binEnd: index === binRanges.length - 1 ? binEnd + 1.0 : binEnd, // second TEMPORARY back end workaround
    binLabel,
  }));
}

function fixLabelForOtherValues(input: string): string {
  return input === TOKEN_UNSELECTED ? 'All other values' : input;
}
