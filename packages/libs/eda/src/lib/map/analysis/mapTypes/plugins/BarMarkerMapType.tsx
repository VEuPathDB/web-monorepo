import { Variable } from '../../../../core/types/study';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import {
  BarPlotMarkerConfiguration,
  BarPlotMarkerConfigurationMenu,
} from '../../MarkerConfiguration/BarPlotMarkerConfigurationMenu';
import {
  MapTypeConfigPanelProps,
  MapTypeLegendProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
  MapTypeTimeSliderProps,
} from '../types';
import {
  OverlayConfig,
  StandaloneMapMarkersResponse,
} from '../../../../core/api/DataClient/types';
import { getDefaultAxisRange } from '../../../../core/utils/computeDefaultAxisRange';
import { NumberRange } from '@veupathdb/components/lib/types/general';
import { mFormatter } from '../../../../core/utils/big-number-formatters';
import ChartMarker, {
  BaseMarkerData,
  ChartMarkerProps,
} from '@veupathdb/components/lib/map/ChartMarker';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../../constants';
import {
  DistributionMarkerDataProps,
  SelectableMarkers,
  markerDataFilterFuncs,
  pieOrBarMarkerConfigLittleFilter,
  useCategoricalValues,
  useDistributionMarkerData,
  useDistributionOverlayConfig,
  visibleOptionFilterFuncs,
  getErrorOverlayComponent,
  getLegendErrorMessage,
} from '../shared';
import { useSubsettingClient } from '../../../../core/hooks/workspace';
import { MapLegend } from '../../MapLegend';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { BarPlotMarkersIcon } from '../../MarkerConfiguration/icons';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { useLittleFilters } from '../../littleFilters';
import TimeSliderQuickFilter from '../../TimeSliderQuickFilter';

const displayName = 'Bar plots';

export const plugin: MapTypePlugin = {
  type: 'barplot',
  displayName,
  Icon: BarPlotMarkersIcon,
  ConfigPanelComponent,
  MapLayerComponent,
  LegendComponent,
  TimeSliderComponent,
};

interface ChartMarkerDataWithCounts extends BaseMarkerData {
  count: number;
}

type ChartMarkerPropsWithCounts = Omit<ChartMarkerProps, 'data'> & {
  data: ChartMarkerDataWithCounts[];
};

function ConfigPanelComponent(props: MapTypeConfigPanelProps) {
  const {
    apps,
    analysisState,
    appState,
    geoConfigs,
    geoConfig,
    updateConfiguration,
    studyId,
    studyEntities,
    filters,
    disabledVariables,
  } = props;

  const subsettingClient = useSubsettingClient();
  const configuration = props.configuration as BarPlotMarkerConfiguration;
  const { selectedVariable, selectedValues, binningMethod } = configuration;

  const { entity: overlayEntity, variable: overlayVariable } =
    findEntityAndVariable(studyEntities, selectedVariable) ?? {};

  if (
    overlayEntity == null ||
    overlayVariable == null ||
    !Variable.is(overlayVariable)
  ) {
    throw new Error(
      'Could not find overlay variable: ' + JSON.stringify(selectedVariable)
    );
  }

  const { filters: filtersForVisibleOption } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    visibleOptionFilterFuncs
  );

  const allFilteredCategoricalValues = useCategoricalValues({
    overlayEntity,
    studyId,
    overlayVariable,
    filters,
  });

  const allVisibleCategoricalValues = useCategoricalValues({
    overlayEntity,
    studyId,
    overlayVariable,
    filters: filtersForVisibleOption,
    enabled: configuration.selectedCountsOption === 'visible',
  });

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const overlayConfiguration = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const markerVariableConstraints = apps
    .find((app) => app.name === 'standalone-map')
    ?.visualizations.find(
      (viz) => viz.name === 'map-markers'
    )?.dataElementConstraints;

  return (
    <BarPlotMarkerConfigurationMenu
      onChange={updateConfiguration}
      configuration={configuration}
      constraints={markerVariableConstraints}
      overlayConfiguration={overlayConfiguration.data}
      overlayVariable={overlayVariable}
      subsettingClient={subsettingClient}
      studyId={studyId}
      filters={filters}
      allFilteredCategoricalValues={allFilteredCategoricalValues.data}
      allVisibleCategoricalValues={allVisibleCategoricalValues.data}
      inputs={[{ name: 'overlayVariable', label: 'Overlay' }]}
      entities={studyEntities}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
      geoConfig={geoConfig}
      disabledVariables={disabledVariables}
    />
  );
}

function MapLayerComponent(props: MapTypeMapLayerProps) {
  const {
    studyEntities,
    studyId,
    filters,
    geoConfigs,
    geoConfig,
    appState,
    appState: { boundsZoomLevel },
    selection,
  } = props;

  const {
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    selectedPlotMode,
  } = props.configuration as BarPlotMarkerConfiguration;

  const { filters: filtersForMarkerData } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    markerDataFilterFuncs
  );

  const overlayConfigQueryResult = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const markerData = useMarkerData({
    studyEntities,
    studyId,
    filters: filtersForMarkerData,
    geoConfig,
    boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    valueSpec: selectedPlotMode,
    overlayConfigQueryResult,
  });

  if (markerData.error && !markerData.isFetching)
    return getErrorOverlayComponent(markerData.error);

  // convert marker data to markers
  const markers = markerData.markerProps?.map((markerProps) => (
    <ChartMarker {...markerProps} />
  ));

  return (
    <>
      {markerData.isFetching && <Spinner />}
      {markers && (
        <SelectableMarkers
          markers={markers}
          selection={selection}
          isFetching={markerData.isFetching}
          initialFit={props.initialFit}
        />
      )}
    </>
  );
}

function LegendComponent(props: MapTypeLegendProps) {
  const { studyEntities, studyId, filters, geoConfig } = props;

  const configuration = props.configuration as BarPlotMarkerConfiguration;
  const { binningMethod, selectedVariable, selectedValues } = configuration;
  const overlayConfigQueryResult = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const markerData = useMarkerData({
    studyEntities,
    studyId,
    filters,
    geoConfig,
    selectedVariable,
    binningMethod,
    dependentAxisLogScale: configuration.dependentAxisLogScale,
    selectedValues,
    valueSpec: configuration.selectedPlotMode,
    overlayConfigQueryResult,
  });

  return (
    getLegendErrorMessage(markerData.error) ?? (
      <MapLegend
        isLoading={markerData.isFetching}
        plotLegendProps={{
          type: 'list',
          legendItems: markerData.legendItems ?? [],
        }}
        showCheckbox={false}
      />
    )
  );
}

const timeSliderFilterFuncs = [pieOrBarMarkerConfigLittleFilter];

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

///// helpers and hooks /////

const processRawMarkersData = (
  mapElements: StandaloneMapMarkersResponse['mapElements'],
  defaultDependentAxisRange: NumberRange,
  dependentAxisLogScale: boolean,
  vocabulary?: string[],
  overlayType?: 'categorical' | 'continuous'
): ChartMarkerPropsWithCounts[] => {
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
            // provide a simple entity count marker in a neutral gray
            [
              {
                label: 'unknown',
                value: entityCount,
                color: '#333',
                count: entityCount,
              },
            ];

      const count =
        vocabulary != null && overlayValues // if there's an overlay (all expected use cases)
          ? overlayValues
              .filter(({ binLabel }) => vocabulary.includes(binLabel))
              .reduce((sum, { count }) => (sum = sum + count), 0)
          : entityCount; // fallback if not

      return {
        data: reorderedData,
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
        duration: defaultAnimationDuration,
        markerLabel: mFormatter(count),
        dependentAxisRange: defaultDependentAxisRange,
        dependentAxisLogScale,
      };
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

export interface MarkerDataProps extends DistributionMarkerDataProps {
  dependentAxisLogScale?: boolean;
}

export function useMarkerData(props: MarkerDataProps) {
  const {
    data: markerData,
    error,
    isFetching,
    isPreviousData,
  } = useDistributionMarkerData(props);
  if (markerData == null) return { error, isFetching };

  const { mapElements, legendItems, overlayConfig } = markerData;

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
  const { valueMax, valueMinPos } = mapElements
    .flatMap((el) => ('overlayValues' in el ? el.overlayValues : []))
    .reduce(
      ({ valueMax, valueMinPos }, elem) => ({
        valueMax: Math.max(elem.value, valueMax),
        valueMinPos:
          elem.value > 0 && (valueMinPos == null || elem.value < valueMinPos)
            ? elem.value
            : valueMinPos,
      }),
      {
        valueMax: 0,
        valueMinPos: Infinity,
      }
    );

  const defaultDependentAxisRange = getDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    props.dependentAxisLogScale
  ) as NumberRange;

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const markerProps = processRawMarkersData(
    mapElements,
    defaultDependentAxisRange,
    props.dependentAxisLogScale ?? false,
    getVocabulary(overlayConfig),
    overlayConfig.overlayType
  );

  return {
    error,
    isFetching: isFetching || isPreviousData,
    markerProps,
    legendItems,
    overlayConfig,
    boundsZoomLevel: props.boundsZoomLevel,
  };
}

function getVocabulary(overlayConfig: OverlayConfig) {
  switch (overlayConfig.overlayType) {
    case 'categorical':
      return overlayConfig.overlayValues;
    case 'continuous':
      return overlayConfig.overlayValues.map((v) => v.binLabel);
    default:
      return [];
  }
}
