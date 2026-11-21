import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { VariableDescriptor } from '../../../core/types/variable';
import { GeoConfig } from '../../../core/types/geoConfig';
import {
  CategoricalVariableDataShape,
  Filter,
  StandaloneMapMarkersRequestParams,
  StudyEntity,
  Variable,
  useDataClient,
  useFindEntityAndVariable,
  useSubsettingClient,
  OverlayConfig,
} from '../../../core';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { findEntityAndVariable } from '../../../core/utils/study-metadata';
import { leastAncestralEntity } from '../../../core/utils/data-element-constraints';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  DefaultOverlayConfigProps,
  getDefaultOverlayConfig,
} from '../utils/defaultOverlayConfig';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../constants';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots';
import { getCategoricalValues } from '../utils/categoricalValues';
import { Viewport } from '@veupathdb/components/lib/map/MapVEuMap';
import {
  UseLittleFiltersFuncProps,
  UseLittleFiltersProps,
} from '../littleFilters';
import { filtersFromBoundingBox } from '../../../core/utils/visualization';
import { MapFloatingErrorDiv } from '../MapFloatingErrorDiv';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  NoDataError,
  noDataMessage,
} from '../../../core/api/DataClient/NoDataError';
import { ReactElement, useCallback, useEffect, useMemo } from 'react';
import { AppState } from '../appState';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';
import { classifyMarkers } from '../utils/geohashSelection';
import {
  finestGeohashVariableId,
  resolveGeoConfig,
} from '../utils/geoEntities';
import { InitialFitProps, MapSelectionProps, MarkerSummary } from './types';

export const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

export const markerDataFilterFuncs = [timeSliderLittleFilter];
/**
 * Filters for the records/counts of what is selected on the map (or, with
 * no selection, what is in view). Like the former "supporting plots", this
 * deliberately does not include the marker configuration's value filter:
 * records reflect the subset, the time slider and the location.
 */
export const selectionFilterFuncs = [
  timeSliderLittleFilter,
  selectionOrViewportLittleFilter,
];
export const visibleOptionFilterFuncs = [
  timeSliderLittleFilter,
  viewportLittleFilters,
];

export const MAX_FILTERSET_VALUES = 1000;

export interface SharedMarkerConfigurations {
  selectedVariable: VariableDescriptor;
  /** legacy, see appState.ts */
  geoEntityId?: string;
}

/**
 * The location entity of the map: the saved choice, else derived from the
 * active marker configuration (see resolveGeoConfig).
 */
export function getActiveGeoConfig(
  appState: Pick<
    AppState,
    'geoEntityId' | 'markerConfigurations' | 'activeMarkerConfigurationType'
  >,
  geoConfigs: GeoConfig[]
): GeoConfig {
  const activeMarkerConfiguration = appState.markerConfigurations.find(
    (config) => config.type === appState.activeMarkerConfigurationType
  );
  return resolveGeoConfig(geoConfigs, {
    geoEntityId: appState.geoEntityId,
    legacyGeoEntityId: activeMarkerConfiguration?.geoEntityId,
    markerVariable: activeMarkerConfiguration?.selectedVariable,
  });
}

export function useCommonData(
  selectedVariable: VariableDescriptor,
  geoConfig: GeoConfig,
  studyEntities: StudyEntity[],
  boundsZoomLevel?: BoundsViewport
) {
  const { entity: overlayEntity, variable: overlayVariable } =
    findEntityAndVariable(studyEntities, selectedVariable) ?? {};

  if (overlayEntity == null || overlayVariable == null) {
    throw new Error(
      'Could not find overlay variable: ' + JSON.stringify(selectedVariable)
    );
  }

  if (!Variable.is(overlayVariable)) {
    throw new Error('Not a variable');
  }

  const outputEntity = leastAncestralEntity(
    [overlayEntity, geoConfig.entity],
    studyEntities
  );

  if (outputEntity == null) {
    throw new Error('Output entity not found.');
  }

  // prepare some info that the map-markers and overlay requests both need
  const { latitudeVariable, longitudeVariable } = {
    latitudeVariable: {
      entityId: geoConfig.entity.id,
      variableId: geoConfig.latitudeVariableId,
    },
    longitudeVariable: {
      entityId: geoConfig.entity.id,
      variableId: geoConfig.longitudeVariableId,
    },
  };

  // handle the geoAggregateVariable separately because it changes with zoom level
  // and we don't want that to change overlayVariableAndEntity etc because that invalidates
  // the overlayConfigPromise

  const geoAggregateVariables = geoConfig.aggregationVariableIds.map(
    (variableId) => ({
      entityId: geoConfig.entity.id,
      variableId,
    })
  );

  const aggregrationLevel = boundsZoomLevel?.zoomLevel
    ? geoConfig.zoomLevelToAggregationLevel(boundsZoomLevel?.zoomLevel) - 1
    : 0;

  const geoAggregateVariable = geoAggregateVariables[aggregrationLevel];

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

  return {
    overlayEntity,
    overlayVariable,
    outputEntity,
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    geoAggregateVariables,
    viewport,
  };
}

export interface DistributionOverlayConfigProps {
  studyId: string;
  filters?: Filter[];
  overlayVariableDescriptor: VariableDescriptor;
  selectedValues: string[] | undefined;
  binningMethod: DefaultOverlayConfigProps['binningMethod'];
}

export function useDistributionOverlayConfig(
  props: DistributionOverlayConfigProps
) {
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const findEntityAndVariable = useFindEntityAndVariable(props.filters);
  return useQuery({
    keepPreviousData: true,
    queryKey: ['distributionOverlayConfig', props],
    queryFn: async function getOverlayConfig() {
      if (props.selectedValues) {
        const overlayConfig: OverlayConfig = {
          overlayType: 'categorical',
          overlayValues: props.selectedValues,
          overlayVariable: props.overlayVariableDescriptor,
        };
        return overlayConfig;
      }
      const { entity: overlayEntity, variable: overlayVariable } =
        findEntityAndVariable(props.overlayVariableDescriptor) ?? {};
      return getDefaultOverlayConfig({
        studyId: props.studyId,
        filters: props.filters ?? [],
        overlayEntity,
        overlayVariable,
        dataClient,
        subsettingClient,
        binningMethod: props.binningMethod,
      });
    },
  });
}

export interface DistributionMarkerDataProps {
  studyId: string;
  filters?: Filter[];
  studyEntities: StudyEntity[];
  geoConfig: GeoConfig;
  boundsZoomLevel?: BoundsViewport;
  selectedVariable: VariableDescriptor;
  selectedValues: string[] | undefined;
  binningMethod: DefaultOverlayConfigProps['binningMethod'];
  valueSpec: StandaloneMapMarkersRequestParams['config']['valueSpec'];
  overlayConfigQueryResult: UseQueryResult<OverlayConfig | undefined>;
}

export function useDistributionMarkerData(props: DistributionMarkerDataProps) {
  const {
    boundsZoomLevel,
    selectedVariable,
    geoConfig,
    studyId,
    filters,
    studyEntities,
    valueSpec,
    overlayConfigQueryResult,
  } = props;

  const dataClient = useDataClient();

  const {
    geoAggregateVariable,
    outputEntity: { id: outputEntityId },
    latitudeVariable,
    longitudeVariable,
    viewport,
  } = useCommonData(
    selectedVariable,
    geoConfig,
    studyEntities,
    boundsZoomLevel
  );

  const overlayConfig = overlayConfigQueryResult.data;

  const requestParams: StandaloneMapMarkersRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      overlayConfig,
      outputEntityId,
      valueSpec,
      viewport,
    },
  };

  const markerQuery = useQuery({
    keepPreviousData: true,
    queryKey: ['mapMarkers', requestParams],
    queryFn: async () => {
      const markerData = await dataClient.getStandaloneMapMarkers(
        'standalone-map',
        requestParams
      );
      if (overlayConfig == null) return;

      const vocabulary =
        overlayConfig.overlayType === 'categorical' // switch statement style guide time!!
          ? overlayConfig.overlayValues
          : overlayConfig.overlayType === 'continuous'
          ? overlayConfig.overlayValues.map((ov) =>
              typeof ov === 'object' ? ov.binLabel : ''
            )
          : undefined;

      /**
       * create custom legend data
       */
      const legendItems: LegendItemsProps[] =
        vocabulary?.map((label) => ({
          label: fixLabelForOtherValues(label),
          marker: 'square',
          markerColor:
            overlayConfig.overlayType === 'categorical'
              ? ColorPaletteDefault[vocabulary.indexOf(label)]
              : overlayConfig.overlayType === 'continuous'
              ? gradientSequentialColorscaleMap(
                  vocabulary.length > 1
                    ? vocabulary.indexOf(label) / (vocabulary.length - 1)
                    : 0.5
                )
              : undefined,
          // has any geo-facet got an array of overlay data
          // containing at least one element that satisfies label==label
          hasData: markerData.mapElements.some(
            (el) =>
              // TS says el could potentially be a number, and I don't know why
              typeof el === 'object' &&
              'overlayValues' in el &&
              el.overlayValues.some((ov) => ov.binLabel === label)
          ),
          group: 1,
          rank: 1,
        })) ?? [];

      return {
        mapElements: markerData.mapElements,
        legendItems,
        overlayConfig,
        boundsZoomLevel,
      };
    },
    enabled: overlayConfig != null && !overlayConfigQueryResult.isFetching,
  });

  return {
    ...markerQuery,
    error: overlayConfigQueryResult.error ?? markerQuery.error,
    isFetching: overlayConfigQueryResult.isFetching || markerQuery.isFetching,
    isPreviousData: overlayConfigQueryResult.error
      ? false
      : markerQuery.isPreviousData,
  };
}

function fixLabelForOtherValues(input: string): string {
  return input === UNSELECTED_TOKEN ? UNSELECTED_DISPLAY_TEXT : input;
}

interface CategoricalValuesProps {
  studyId: string;
  filters?: Filter[];
  overlayEntity: StudyEntity;
  overlayVariable: Variable;
  enabled?: boolean;
}
export function useCategoricalValues(props: CategoricalValuesProps) {
  const subsettingClient = useSubsettingClient();
  return useQuery({
    queryKey: [
      'categoricalValues',
      props.studyId,
      props.filters,
      props.overlayEntity.id,
      props.overlayVariable.id,
    ],
    queryFn: () => {
      if (!CategoricalVariableDataShape.is(props.overlayVariable.dataShape)) {
        // not allowed to return undefined
        // consider throwing an error if more appropriate
        return [];
      }
      return (
        getCategoricalValues({
          studyId: props.studyId,
          filters: props.filters,
          subsettingClient,
          overlayEntity: props.overlayEntity,
          overlayVariable: props.overlayVariable,
        }) ?? []
      ); // see above re returning undefined
    },
    enabled: props.enabled ?? true,
  });
}

export function isApproxSameViewport(v1: Viewport, v2: Viewport) {
  const epsilon = 2.0;
  return (
    v1.zoom === v2.zoom &&
    Math.abs(v1.center[0] - v2.center[0]) < epsilon &&
    Math.abs(v1.center[1] - v2.center[1]) < epsilon
  );
}

/**
 * little filter helpers
 */

export function timeSliderLittleFilter(props: UseLittleFiltersProps): Filter[] {
  const { timeSliderConfig } = props.appState;

  if (timeSliderConfig != null) {
    const { selectedRange, active, variable } = timeSliderConfig;
    if (variable != null && active && selectedRange != null)
      return [
        {
          type: 'dateRange' as const,
          ...variable,
          min: selectedRange.start + 'T00:00:00Z',
          max: selectedRange.end + 'T00:00:00Z',
        },
      ];
  }
  return [];
}

export function viewportLittleFilters(props: UseLittleFiltersProps): Filter[] {
  const {
    appState: { boundsZoomLevel },
    appState,
    geoConfigs,
  } = props;

  const geoConfig = getActiveGeoConfig(appState, geoConfigs);
  return boundsZoomLevel == null
    ? []
    : filtersFromBoundingBox(
        boundsZoomLevel.bounds,
        {
          variableId: geoConfig.latitudeVariableId,
          entityId: geoConfig.entity.id,
        },
        {
          variableId: geoConfig.longitudeVariableId,
          entityId: geoConfig.entity.id,
        }
      );
}

//
// calculates little filters for pie/bar markers related to
// marker variable selection and custom checked values
//
export function pieOrBarMarkerConfigLittleFilter(
  props: UseLittleFiltersFuncProps
): Filter[] {
  const {
    appState: { markerConfigurations, activeMarkerConfigurationType },
    findEntityAndVariable,
  } = props;

  if (findEntityAndVariable == null)
    throw new Error(
      'Bar markerConfigLittleFilter must receive findEntityAndVariable'
    );

  const activeMarkerConfiguration = markerConfigurations.find(
    (markerConfig) => markerConfig.type === activeMarkerConfigurationType
  );

  // This doesn't seem ideal. Do we ever have no active config?
  if (activeMarkerConfiguration == null) return [];
  const { selectedVariable, type } = activeMarkerConfiguration;
  const { variable } = findEntityAndVariable(selectedVariable) ?? {};
  if (variable != null && (type === 'pie' || type === 'barplot')) {
    if (variable.dataShape !== 'continuous') {
      if (variable.vocabulary != null) {
        // if markers configuration is empty (equivalent to all values selected)
        // or if the "all other values" value is active (aka UNSELECTED_TOKEN)
        if (
          activeMarkerConfiguration.selectedValues == null ||
          activeMarkerConfiguration.selectedValues.includes(UNSELECTED_TOKEN)
        ) {
          if (variable.vocabulary.length <= MAX_FILTERSET_VALUES) {
            return [
              {
                type: 'stringSet' as const,
                ...selectedVariable,
                stringSet: variable.vocabulary,
              },
            ];
          } else {
            console.log(
              'donut/bar marker-config filter skipping ultra-high cardinality variable: ' +
                variable.displayName
            );
            return [];
          }
        } else {
          // We have selected values in pie or barplot mode and no "all other values".
          // Note that we will not (yet) check the number of selections <= MAX_FILTERSET_VALUES here
          // because we will (likely) need to prevent that many being selected in the first place
          // TO DO: https://github.com/VEuPathDB/web-monorepo/issues/820
          if (
            activeMarkerConfiguration.selectedValues != null &&
            activeMarkerConfiguration.selectedValues.length > 0
          )
            return [
              {
                type: 'stringSet' as const,
                ...selectedVariable,
                stringSet: activeMarkerConfiguration.selectedValues,
              },
            ];
          // Edge case where all values are deselected in the marker configuration table
          // and we want the back end filters to return nothing.
          // This is hopefully a workable solution. It is not allowed to pass an
          // empty array to a `stringSet` filter.
          else
            return [
              {
                type: 'stringSet' as const,
                ...selectedVariable,
                stringSet: ['avaluewewillhopefullyneversee'],
              },
            ];
        }
      } else {
        throw new Error('missing vocabulary on categorical variable');
      }
    } else if (variable.type === 'number' || variable.type === 'integer') {
      return [
        {
          type: 'numberRange' as const,
          ...selectedVariable,
          min: variable.distributionDefaults.rangeMin,
          max: variable.distributionDefaults.rangeMax, // TO DO: check we use this, not display ranges
        },
      ];
    } else if (variable.type === 'date') {
      return [
        {
          type: 'dateRange' as const,
          ...selectedVariable,
          min: variable.distributionDefaults.rangeMin + 'T00:00:00Z',
          max: variable.distributionDefaults.rangeMax + 'T00:00:00Z',
          // TO DO: check we use this, not display ranges
        },
      ];
    } else {
      throw new Error(
        'unknown variable type encounted in marker-config filter function'
      );
    }
  }
  return [];
}

/**
 * The map selection as a filter: a `stringPrefixSet` filter on the
 * location entity's finest geohash variable (the same filter the EDA lasso
 * filter produces). No filter if nothing is selected or the selection was
 * made with a different location entity.
 */
export function selectionLittleFilter(props: UseLittleFiltersProps): Filter[] {
  const { appState, geoConfigs } = props;
  const { selection } = appState;
  if (selection == null || selection.prefixes.length === 0) return [];
  const geoConfig = getActiveGeoConfig(appState, geoConfigs);
  if (selection.geoEntityId !== geoConfig.entity.id) return [];
  return [
    {
      type: 'stringPrefixSet' as const,
      entityId: geoConfig.entity.id,
      variableId: finestGeohashVariableId(geoConfig),
      prefixSet: selection.prefixes,
    },
  ];
}

export function hasActiveSelection(props: UseLittleFiltersProps) {
  return selectionLittleFilter(props).length > 0;
}

/** the selection, or what is in view when nothing is selected */
export function selectionOrViewportLittleFilter(
  props: UseLittleFiltersProps
): Filter[] {
  const selectionFilters = selectionLittleFilter(props);
  return selectionFilters.length > 0
    ? selectionFilters
    : viewportLittleFilters(props);
}

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
 * Error handling helpers
 *
 * The patterns are matched against the 500 error messages from the back end
 */

const noDataPatterns = [
  /Could not generate continuous variable metadata/, // comes from continuous-variable-metadata endpoint
];

export function isNoDataError(error: unknown) {
  if (error instanceof NoDataError) return true;
  return noDataPatterns.some((pattern) => String(error).match(pattern));
}

export function getErrorOverlayComponent(error: unknown) {
  return isNoDataError(error) ? (
    <MapFloatingErrorDiv>
      <Banner
        banner={{
          type: 'warning',
          message: error instanceof NoDataError ? error.message : noDataMessage,
        }}
      />
    </MapFloatingErrorDiv>
  ) : (
    <MapFloatingErrorDiv error={error} />
  );
}

const noDataLegendMessage = (
  <div css={{ textAlign: 'center', width: 200 }}>
    <p>Your filters have removed all data for this variable.</p>
    <p>Please check your filters or choose another variable.</p>
  </div>
);

export function getLegendErrorMessage(error: unknown) {
  return isNoDataError(error) ? noDataLegendMessage : undefined;
}

/**
 * SemanticMarkers wired up to the map selection: highlights the markers
 * inside (or partly inside) the selected geohash prefixes, forwards click,
 * box and lasso gestures, and reports the drawn markers.
 */
export function SelectableMarkers({
  markers,
  selection,
  isFetching,
  initialFit,
}: {
  markers: ReactElement<BoundsDriftMarkerProps>[];
  selection: MapSelectionProps;
  isFetching: boolean;
  initialFit: InitialFitProps;
}) {
  const summaries: MarkerSummary[] = useMemo(
    () =>
      markers.map(({ props: { id, position, bounds } }) => ({
        id,
        position,
        bounds,
      })),
    [markers]
  );

  const { onMarkersRendered, onMarkerContextMenu, prefixes } = selection;
  useEffect(() => {
    if (!isFetching) onMarkersRendered(summaries);
  }, [summaries, isFetching, onMarkersRendered]);

  const { selected, partiallySelected } = useMemo(
    () =>
      classifyMarkers(
        summaries.map(({ id }) => id),
        prefixes
      ),
    [summaries, prefixes]
  );

  const handleContextMenu = useCallback(
    (markerId: string) => {
      const summary = summaries.find(({ id }) => id === markerId);
      if (summary) onMarkerContextMenu(summary);
    },
    [summaries, onMarkerContextMenu]
  );

  // SemanticMarkers fits the map whenever it renders with flyToMarkers on
  // and new markers - and plugins build a new markers array on every
  // render. So turn it on for exactly one render: this effect runs after
  // SemanticMarkers' own (child effects run first), and switches it off.
  const fitNow = initialFit.pending && !isFetching && markers.length > 0;
  const { onStarted: onFitStarted } = initialFit;
  useEffect(() => {
    if (fitNow) onFitStarted();
  }, [fitNow, onFitStarted]);

  return (
    <SemanticMarkers
      markers={markers}
      animation={defaultAnimation}
      flyToMarkers={fitNow}
      flyToMarkersDelay={500}
      selectedMarkers={selected}
      partiallySelectedMarkers={partiallySelected}
      onSelectionGesture={selection.onSelectionGesture}
      onMarkerContextMenu={handleContextMenu}
      lassoActive={selection.lassoActive}
      onLassoDeactivated={selection.onLassoDeactivated}
    />
  );
}
