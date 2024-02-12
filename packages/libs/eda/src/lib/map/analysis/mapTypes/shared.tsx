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
import { useQuery } from '@tanstack/react-query';
import {
  DefaultOverlayConfigProps,
  getDefaultOverlayConfig,
} from '../utils/defaultOverlayConfig';
import { sumBy } from 'lodash';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../constants';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots';
import { getCategoricalValues } from '../utils/categoricalValues';
import { Viewport } from '@veupathdb/components/lib/map/MapVEuMap';
import { UseLittleFiltersProps } from '../littleFilters';
import { filtersFromBoundingBox } from '../../../core/utils/visualization';

export const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

export const markerDataFilterFuncs = [timeSliderLittleFilter];
export const floaterFilterFuncs = [
  timeSliderLittleFilter,
  viewportLittleFilters,
];
export const visibleOptionFilterFuncs = [
  timeSliderLittleFilter,
  viewportLittleFilters,
];

export const MAX_FILTERSET_VALUES = 1000;

export interface SharedMarkerConfigurations {
  selectedVariable: VariableDescriptor;
  activeVisualizationId?: string;
}

export function useCommonData(
  selectedVariable: VariableDescriptor,
  geoConfigs: GeoConfig[],
  studyEntities: StudyEntity[],
  boundsZoomLevel?: BoundsViewport
) {
  const geoConfig = geoConfigs[0];

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
  const findEntityAndVariable = useFindEntityAndVariable();
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
  geoConfigs: GeoConfig[];
  boundsZoomLevel?: BoundsViewport;
  selectedVariable: VariableDescriptor;
  selectedValues: string[] | undefined;
  binningMethod: DefaultOverlayConfigProps['binningMethod'];
  valueSpec: StandaloneMapMarkersRequestParams['config']['valueSpec'];
}

export function useDistributionMarkerData(props: DistributionMarkerDataProps) {
  const {
    boundsZoomLevel,
    selectedVariable,
    binningMethod,
    geoConfigs,
    studyId,
    filters,
    studyEntities,
    selectedValues,
    valueSpec,
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
    geoConfigs,
    studyEntities,
    boundsZoomLevel
  );

  const overlayConfigResult = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const requestParams: StandaloneMapMarkersRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      overlayConfig: overlayConfigResult.data,
      outputEntityId,
      valueSpec,
      viewport,
    },
  };
  const overlayConfig = overlayConfigResult.data;

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

      const totalVisibleEntityCount = markerData?.mapElements.reduce(
        (acc, curr) => {
          return acc + curr.entityCount;
        },
        0
      );

      const countSum = sumBy(markerData?.mapElements, 'entityCount');

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
        totalVisibleWithOverlayEntityCount: countSum,
        totalVisibleEntityCount,
        legendItems,
        overlayConfig,
        boundsZoomLevel,
      };
    },
    enabled: overlayConfig != null && !overlayConfigResult.isFetching,
  });

  return {
    ...markerQuery,
    error: overlayConfigResult.error ?? markerQuery.error,
    isFetching: overlayConfigResult.isFetching || markerQuery.isFetching,
    isPreviousData: overlayConfigResult.error
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

function timeSliderLittleFilter(props: UseLittleFiltersProps): Filter[] {
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

function viewportLittleFilters(props: UseLittleFiltersProps): Filter[] {
  const {
    appState: { boundsZoomLevel },
    geoConfigs,
  } = props;
  const geoConfig = geoConfigs[0]; // not ideal...
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
  props: UseLittleFiltersProps
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
  /did not contain any data/, // comes from map-markers endpoint
  /Could not generate continuous variable metadata/, // comes from continuous-variable-metadata endpoint
];

export function isNoDataError(error: unknown) {
  return noDataPatterns.some((pattern) => String(error).match(pattern));
}

export const noDataErrorMessage = (
  <div css={{ textAlign: 'center', width: 200 }}>
    <p>Your filters have removed all data for this variable.</p>
    <p>Please check your filters or choose another variable.</p>
  </div>
);
