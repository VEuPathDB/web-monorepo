import BubbleMarker, {
  BubbleMarkerProps,
} from '@veupathdb/components/lib/map/BubbleMarker';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { getValueToGradientColorMapper } from '@veupathdb/components/lib/types/plots/addOns';
import { capitalize, omit } from 'lodash';
import { useMemo } from 'react';
import {
  useFindEntityAndVariable,
  Filter,
  useDataClient,
  useStudyEntities,
} from '../../../../core';
import {
  BubbleOverlayConfig,
  StandaloneMapBubblesLegendRequestParams,
  StandaloneMapBubblesRequestParams,
  StandaloneMapBubblesResponse,
} from '../../../../core/api/DataClient/types';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { MapLegend } from '../../MapLegend';
import { BubbleMarkerConfigurationMenu } from '../../MarkerConfiguration';
import { BubbleMarkerConfiguration } from '../../MarkerConfiguration/BubbleMarkerConfigurationMenu';
import { BubbleMarkerIcon } from '../../MarkerConfiguration/icons';
import { getDefaultBubbleOverlayConfig } from '../../utils/defaultOverlayConfig';
import {
  MAX_FILTERSET_VALUES,
  SelectableMarkers,
  markerDataFilterFuncs,
  useCommonData,
  getErrorOverlayComponent,
} from '../shared';
import {
  MapTypeConfigPanelProps,
  MapTypeLegendProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
  MapTypeTimeSliderProps,
} from '../types';
import { VariableDescriptor } from '../../../../core/types/variable';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../../core/types/geoConfig';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import {
  useLittleFilters,
  UseLittleFiltersFuncProps,
} from '../../littleFilters';
import TimeSliderQuickFilter from '../../TimeSliderQuickFilter';

const displayName = 'Bubbles';

export const plugin: MapTypePlugin = {
  type: 'bubble',
  displayName,
  Icon: BubbleMarkerIcon,
  ConfigPanelComponent: BubbleMapConfigurationPanel,
  MapLayerComponent: BubbleMapLayer,
  LegendComponent: BubbleLegends,
  TimeSliderComponent,
};

type BubbleLegendData = {
  bubbleLegendData: {
    minColorValue: number;
    maxColorValue: number;
    minSizeValue: number;
    maxSizeValue: number;
  };
  bubbleValueToDiameterMapper: (value: number) => number;
  bubbleValueToColorMapper: ((value: number) => string) | undefined;
  bubbleValueToLegendTickMapper: ((val: number) => string) | undefined;
};

function BubbleMapConfigurationPanel(props: MapTypeConfigPanelProps) {
  const {
    apps,
    analysisState,
    studyEntities,
    updateConfiguration,
    studyId,
    filters,
    disabledVariables,
  } = props;

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const markerConfiguration = props.configuration as BubbleMarkerConfiguration;

  const markerVariableConstraints = apps
    .find((app) => app.name === 'standalone-map')
    ?.visualizations.find(
      (viz) => viz.name === 'map-markers'
    )?.dataElementConstraints;

  // If the variable or filters have changed on the active marker config
  // get the default overlay config.
  const { overlayConfig, isValidProportion } = useOverlayConfig({
    studyId,
    filters,
    ...markerConfiguration,
  });

  return (
    <BubbleMarkerConfigurationMenu
      entities={studyEntities}
      onChange={updateConfiguration}
      configuration={markerConfiguration}
      overlayConfiguration={overlayConfig}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
      constraints={markerVariableConstraints}
      isValidProportion={isValidProportion}
      disabledVariables={disabledVariables}
    />
  );
}

/**
 * Renders markers
 */
function BubbleMapLayer(props: MapTypeMapLayerProps) {
  const {
    studyId,
    filters,
    appState,
    appState: { boundsZoomLevel },
    geoConfigs,
    geoConfig,
    selection,
  } = props;

  const configuration = props.configuration as BubbleMarkerConfiguration;

  const { isValidProportion } = useOverlayConfig({
    studyId,
    filters,
    ...configuration,
  });

  const { filters: filtersForMarkerData } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    markerDataFilterFuncs
  );

  const legendData = useLegendData({
    studyId,
    filters,
    geoConfig,
    configuration,
  });

  const markersData = useMarkerData({
    boundsZoomLevel,
    configuration,
    geoConfig,
    studyId,
    filters: filtersForMarkerData,
    legendData,
  });

  if (markersData.error && !markersData.isFetching)
    return getErrorOverlayComponent(markersData.error);

  const markers = markersData.data?.markersData?.map((markerProps) => (
    <BubbleMarker {...markerProps} />
  ));

  return (
    <>
      {markersData.isFetching && <Spinner />}
      {markers && (isValidProportion == null || isValidProportion) && (
        <SelectableMarkers
          markers={markers}
          selection={selection}
          isFetching={markersData.isFetching || markersData.isPreviousData}
          initialFit={props.initialFit}
        />
      )}
    </>
  );
}

/** size (count) and colour legends */
function BubbleLegends(props: MapTypeLegendProps) {
  const { studyId, filters, geoConfig } = props;
  const configuration = props.configuration as BubbleMarkerConfiguration;

  const { isValidProportion, overlayConfig } = useOverlayConfig({
    studyId,
    filters,
    ...configuration,
  });
  const { aggregationConfig } = overlayConfig;

  const legendData = useLegendData({
    studyId,
    filters,
    geoConfig,
    configuration,
  });

  if (isValidProportion === false)
    return (
      <div css={{ textAlign: 'center', width: 200 }}>
        The bubble marker proportion configuration has become invalid. Please
        reconfigure.
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Count</div>
        <MapLegend
          isLoading={legendData.isFetching}
          plotLegendProps={{
            type: 'bubble',
            legendMax: legendData.data?.bubbleLegendData?.maxSizeValue ?? 0,
            valueToDiameterMapper: legendData.data?.bubbleValueToDiameterMapper,
          }}
        />
      </div>
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>
          {aggregationConfig.overlayType === 'continuous'
            ? capitalize(aggregationConfig.aggregator)
            : 'Proportion'}
        </div>
        <MapLegend
          isLoading={legendData.isFetching}
          plotLegendProps={{
            type: 'colorscale',
            legendMin: legendData.data?.bubbleLegendData?.minColorValue ?? 0,
            legendMax: legendData.data?.bubbleLegendData?.maxColorValue ?? 0,
            valueToColorMapper:
              legendData.data?.bubbleValueToColorMapper ?? (() => 'white'),
            valueToTickStringMapper:
              legendData.data?.bubbleValueToLegendTickMapper,
          }}
        />
      </div>
    </div>
  );
}

const timeSliderFilterFuncs = [markerConfigLittleFilter];

export function TimeSliderComponent(props: MapTypeTimeSliderProps) {
  const {
    studyId,
    studyEntities,
    filters,
    appState,
    appState: { timeSliderConfig },
    analysisState,
    geoConfigs,
    setTimeSliderConfig,
    siteInformationProps,
  } = props;

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const { filters: filtersForTimeSlider } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    timeSliderFilterFuncs
  );

  return timeSliderConfig ? (
    <TimeSliderQuickFilter
      studyId={studyId}
      entities={studyEntities}
      filters={filtersForTimeSlider}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
      config={timeSliderConfig}
      updateConfig={setTimeSliderConfig}
      siteInformation={siteInformationProps}
    />
  ) : null;
}

///// helpers and hooks //////

const processRawBubblesData = (
  mapElements: StandaloneMapBubblesResponse['mapElements'],
  aggregationConfig?: BubbleOverlayConfig['aggregationConfig'] & {
    valueType?: 'number' | 'date';
  },
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

      const colorNumericValue =
        aggregationConfig?.overlayType === 'continuous' &&
        aggregationConfig.valueType === 'date'
          ? new Date(overlayValue).getTime()
          : Number(overlayValue);

      const bubbleData = {
        value: entityCount,
        diameter: bubbleValueToDiameterMapper?.(entityCount) ?? 0,
        colorValue: limitPrecisionIfNumber(overlayValue, 4),
        colorLabel: aggregationConfig
          ? aggregationConfig.overlayType === 'continuous'
            ? capitalize(aggregationConfig.aggregator)
            : 'Proportion'
          : undefined,
        color: bubbleValueToColorMapper?.(colorNumericValue),
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

interface OverlayConfigProps {
  selectedVariable?: VariableDescriptor;
  studyId: string;
  filters?: Filter[];
  aggregator?: BubbleMarkerConfiguration['aggregator'];
  numeratorValues?: BubbleMarkerConfiguration['numeratorValues'];
  denominatorValues?: BubbleMarkerConfiguration['denominatorValues'];
}

function useOverlayConfig(props: OverlayConfigProps) {
  const {
    studyId,
    filters,
    aggregator,
    numeratorValues,
    denominatorValues,
    selectedVariable,
  } = props;
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const entityAndVariable = findEntityAndVariable(selectedVariable);

  if (entityAndVariable == null)
    throw new Error(
      'Invalid selected variable: ' + JSON.stringify(selectedVariable)
    );
  const { entity: overlayEntity, variable: overlayVariable } =
    entityAndVariable;
  // If the variable or filters have changed on the active marker config
  // get the default overlay config.
  return useMemo(() => {
    return getDefaultBubbleOverlayConfig({
      studyId,
      overlayVariable,
      overlayEntity,
      aggregator,
      numeratorValues,
      denominatorValues,
    });
  }, [
    studyId,
    overlayVariable,
    overlayEntity,
    aggregator,
    numeratorValues,
    denominatorValues,
  ]);
}

interface DataProps {
  boundsZoomLevel?: BoundsViewport;
  configuration: BubbleMarkerConfiguration;
  geoConfig: GeoConfig;
  studyId: string;
  filters?: Filter[];
  legendData?: UseQueryResult<BubbleLegendData>;
}

function useLegendData(props: DataProps) {
  const { configuration, geoConfig, studyId, filters } = props;

  const studyEntities = useStudyEntities();
  const dataClient = useDataClient();

  const { selectedVariable, numeratorValues, denominatorValues, aggregator } =
    configuration as BubbleMarkerConfiguration;

  const { outputEntity, geoAggregateVariables } = useCommonData(
    selectedVariable,
    geoConfig,
    studyEntities
  );

  const outputEntityId = outputEntity?.id;

  const { overlayConfig, isValidProportion } = useOverlayConfig({
    studyId,
    filters,
    selectedVariable,
    aggregator,
    numeratorValues,
    denominatorValues,
  });

  const disabled =
    numeratorValues?.length === 0 ||
    denominatorValues?.length === 0 ||
    isValidProportion === false;

  const { aggregationConfig, ...restOverlayConfig } = overlayConfig;
  const valueType =
    aggregationConfig.overlayType === 'continuous'
      ? aggregationConfig.valueType
      : undefined;
  const legendRequestParams: StandaloneMapBubblesLegendRequestParams = {
    studyId,
    filters: filters || [], // OK for react-query, but not for hooks in general
    config: {
      outputEntityId,
      colorLegendConfig: {
        geoAggregateVariable: geoAggregateVariables.at(-1)!,
        quantitativeOverlayConfig: {
          ...restOverlayConfig,
          aggregationConfig:
            aggregationConfig.overlayType === 'continuous'
              ? omit(aggregationConfig, 'valueType') // back end mustn't receive `valueType`
              : aggregationConfig,
        },
      },
      sizeConfig: {
        geoAggregateVariable: geoAggregateVariables[0],
      },
    },
  };

  return useQuery({
    queryKey: ['bubbleMarkers', 'legendData', legendRequestParams],
    queryFn: async () => {
      // temporarily convert potentially date-strings to numbers
      // but don't worry - we are also temporarily disabling date variables from bubble mode
      const temp = await dataClient.getStandaloneBubblesLegend(
        'standalone-map',
        legendRequestParams
      );

      const colorData =
        valueType === 'date'
          ? {
              minColorValue: new Date(temp.minColorValue).getTime(),
              maxColorValue: new Date(temp.maxColorValue).getTime(),
            }
          : {
              minColorValue: Number(temp.minColorValue),
              maxColorValue: Number(temp.maxColorValue),
            };

      const bubbleLegendData = {
        ...colorData,
        minSizeValue: temp.minSizeValue,
        maxSizeValue: temp.maxSizeValue,
      };

      const adjustedSizeData =
        bubbleLegendData.minSizeValue === bubbleLegendData.maxSizeValue
          ? {
              minSizeValue: 0,
              maxSizeValue: bubbleLegendData.maxSizeValue || 1,
            }
          : undefined;

      const adjustedColorData =
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
          : undefined;

      const adjustedBubbleLegendData = {
        ...bubbleLegendData,
        ...adjustedSizeData,
        ...adjustedColorData,
      };

      const bubbleValueToDiameterMapper = (value: number) => {
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
          smallestCircleDiameter - m * adjustedBubbleLegendData.minSizeValue;
        const diameter = m * value + b;

        // return 2 * radius;
        return diameter;
      };

      const bubbleValueToColorMapper = getValueToGradientColorMapper(
        adjustedBubbleLegendData.minColorValue,
        adjustedBubbleLegendData.maxColorValue
      );

      const bubbleValueToLegendTickMapper =
        valueType === 'date'
          ? (val: number) => {
              return new Date(val).toISOString().substring(0, 10);
            }
          : undefined;

      return {
        bubbleLegendData: adjustedBubbleLegendData,
        bubbleValueToDiameterMapper,
        bubbleValueToColorMapper,
        bubbleValueToLegendTickMapper,
      };
    },
    enabled: !disabled,
  });
}

function useRawMarkerData(props: DataProps) {
  const { boundsZoomLevel, configuration, geoConfig, studyId, filters } = props;

  const { numeratorValues, denominatorValues } = configuration;

  const studyEntities = useStudyEntities();
  const dataClient = useDataClient();

  const {
    outputEntity,
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    viewport,
  } = useCommonData(
    configuration.selectedVariable,
    geoConfig,
    studyEntities,
    boundsZoomLevel
  );

  const outputEntityId = outputEntity?.id;

  const { overlayConfig, isValidProportion } = useOverlayConfig({
    studyId,
    filters,
    ...configuration,
  });

  const { aggregationConfig, ...restOverlayConfig } = overlayConfig;
  const markerRequestParams: StandaloneMapBubblesRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      overlayConfig: {
        ...restOverlayConfig,
        aggregationConfig:
          aggregationConfig.overlayType === 'continuous'
            ? omit(aggregationConfig, 'valueType') // back end mustn't receive valueType
            : aggregationConfig,
      },
      outputEntityId,
      valueSpec: 'count',
      viewport,
    },
  };

  // add to check legendData is undefined for refetch
  const disabled =
    numeratorValues?.length === 0 ||
    denominatorValues?.length === 0 ||
    isValidProportion === false;

  return useQuery({
    queryKey: ['bubbleMarkers', 'markerData', markerRequestParams],
    queryFn: async () => {
      const rawMarkersData = await dataClient.getStandaloneBubbles(
        'standalone-map',
        markerRequestParams
      );
      return rawMarkersData;
    },
    enabled: !disabled,
  });
}

function useMarkerData(props: DataProps) {
  const { boundsZoomLevel, configuration, studyId, filters, legendData } =
    props;

  const rawMarkersResult = useRawMarkerData(props);
  const { overlayConfig } = useOverlayConfig({
    studyId,
    filters,
    ...configuration,
  });

  // spoof the useQuery hook
  return useMemo(() => {
    /**
     * Merge the overlay data into the basicMarkerData, if available,
     * and create markers.
     */
    const { bubbleValueToColorMapper, bubbleValueToDiameterMapper } =
      legendData?.data ?? {};
    const finalMarkersData =
      rawMarkersResult.data != null
        ? processRawBubblesData(
            rawMarkersResult.data.mapElements,
            overlayConfig.aggregationConfig,
            bubbleValueToDiameterMapper,
            bubbleValueToColorMapper
          )
        : undefined;

    return {
      ...rawMarkersResult, // for error, isFetching etc
      data: {
        markersData: finalMarkersData,
        boundsZoomLevel,
      },
    };
  }, [rawMarkersResult, legendData?.data, overlayConfig, boundsZoomLevel]);
}

//
// calculates little filters related to
// marker variable selection and custom checked values
//
function markerConfigLittleFilter(props: UseLittleFiltersFuncProps): Filter[] {
  const {
    appState: { markerConfigurations, activeMarkerConfigurationType },
    findEntityAndVariable,
  } = props;

  if (findEntityAndVariable == null)
    throw new Error(
      'Bubble markerConfigLittleFilter must receive findEntityAndVariable'
    );

  const activeMarkerConfiguration = markerConfigurations.find(
    (markerConfig) => markerConfig.type === activeMarkerConfigurationType
  );

  // This doesn't seem ideal. Do we ever have no active config?
  if (activeMarkerConfiguration == null) return [];
  const { selectedVariable, type } = activeMarkerConfiguration;
  const { variable } = findEntityAndVariable(selectedVariable) ?? {};
  if (variable != null && type === 'bubble') {
    if (variable.dataShape !== 'continuous') {
      if (variable.vocabulary != null) {
        // if markers configuration is empty (equivalent to all values selected)
        // or if the "all other values" value is active (aka UNSELECTED_TOKEN)
        if (
          activeMarkerConfiguration.numeratorValues == null &&
          activeMarkerConfiguration.denominatorValues == null
        ) {
          if (variable.vocabulary.length <= MAX_FILTERSET_VALUES)
            return [
              {
                type: 'stringSet' as const,
                ...selectedVariable,
                stringSet: variable.vocabulary,
              },
            ];
          else {
            console.log(
              'bubble marker-config filter skipping ultra-high cardinality variable: ' +
                variable.displayName
            );
            return [];
          }
        } else {
          // must be bubble with custom proportion configuration
          // use all the selected values from both
          const allSelectedValues = Array.from(
            new Set([
              ...(activeMarkerConfiguration.numeratorValues ?? []),
              ...(activeMarkerConfiguration.denominatorValues ?? []),
            ])
          );
          // Note that we will not (yet) check the number of selections <= MAX_FILTERSET_VALUES here
          // because we will (likely) need to prevent that many being selected in the first place
          // TO DO: https://github.com/VEuPathDB/web-monorepo/issues/820
          return [
            {
              type: 'stringSet' as const,
              ...selectedVariable,
              stringSet:
                allSelectedValues.length > 0
                  ? allSelectedValues
                  : ['avaluewewillhopefullyneversee'],
            },
          ];
        }
      } else {
        throw new Error(
          'missing vocabulary for categorical variable: ' + variable.displayName
        );
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
        'unknown variable type in bubble marker-config filter function'
      );
    }
  }
  return [];
}

function limitPrecisionIfNumber(str: string, precision: number) {
  const num = parseFloat(str);
  if (isNaN(num)) {
    return str; // Return the original string if it's not a number
  }
  return num.toPrecision(precision);
}
