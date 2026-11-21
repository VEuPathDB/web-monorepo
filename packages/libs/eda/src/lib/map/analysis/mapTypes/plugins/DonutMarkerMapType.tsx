import DonutMarker, {
  DonutMarkerProps,
} from '@veupathdb/components/lib/map/DonutMarker';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../../constants';
import {
  StandaloneMapMarkersResponse,
  Variable,
  useSubsettingClient,
} from '../../../../core';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { kFormatter } from '../../../../core/utils/big-number-formatters';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import { MapLegend } from '../../MapLegend';
import {
  PieMarkerConfiguration,
  PieMarkerConfigurationMenu,
} from '../../MarkerConfiguration/PieMarkerConfigurationMenu';
import {
  DistributionMarkerDataProps,
  SelectableMarkers,
  useCategoricalValues,
  useDistributionMarkerData,
  useDistributionOverlayConfig,
  visibleOptionFilterFuncs,
  markerDataFilterFuncs,
  pieOrBarMarkerConfigLittleFilter,
  getErrorOverlayComponent,
  getLegendErrorMessage,
} from '../shared';
import {
  MapTypeConfigPanelProps,
  MapTypeLegendProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
  MapTypeTimeSliderProps,
} from '../types';
import { DonutMarkersIcon } from '../../MarkerConfiguration/icons';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { useLittleFilters } from '../../littleFilters';
import TimeSliderQuickFilter from '../../TimeSliderQuickFilter';

const displayName = 'Donuts';

export const plugin: MapTypePlugin = {
  type: 'pie',
  displayName,
  Icon: DonutMarkersIcon,
  ConfigPanelComponent,
  MapLayerComponent,
  LegendComponent,
  TimeSliderComponent,
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
  const configuration = props.configuration as PieMarkerConfiguration;
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
    <PieMarkerConfigurationMenu
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
    studyId,
    studyEntities,
    appState,
    appState: { boundsZoomLevel },
    geoConfigs,
    geoConfig,
    filters,
    selection,
  } = props;

  const configuration = props.configuration as PieMarkerConfiguration;

  const { selectedVariable, binningMethod, selectedValues } = configuration;

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

  const markerDataResponse = useMarkerData({
    studyId,
    filters: filtersForMarkerData,
    studyEntities,
    geoConfig,
    boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    valueSpec: 'count',
    overlayConfigQueryResult,
  });

  // no markers and no error div for certain known error strings
  if (markerDataResponse.error && !markerDataResponse.isFetching)
    return getErrorOverlayComponent(markerDataResponse.error);

  // convert marker data into markers
  const markers = markerDataResponse.markerProps?.map((markerProps) => (
    <DonutMarker {...markerProps} />
  ));

  return (
    <>
      {markerDataResponse.isFetching && <Spinner />}
      {markers && (
        <SelectableMarkers
          markers={markers}
          selection={selection}
          isFetching={markerDataResponse.isFetching}
          initialFit={props.initialFit}
        />
      )}
    </>
  );
}

function LegendComponent(props: MapTypeLegendProps) {
  const { studyId, studyEntities, geoConfig, filters } = props;

  const configuration = props.configuration as PieMarkerConfiguration;
  const { selectedVariable, selectedValues, binningMethod } = configuration;

  const overlayConfigQueryResult = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const data = useMarkerData({
    studyId,
    filters,
    studyEntities,
    geoConfig,
    binningMethod,
    selectedVariable,
    selectedValues,
    valueSpec: 'count',
    overlayConfigQueryResult,
  });

  return (
    getLegendErrorMessage(data.error) ?? (
      <MapLegend
        isLoading={data.isFetching}
        plotLegendProps={{
          type: 'list',
          legendItems: data.legendItems ?? [],
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

////// functions and hooks ///////

export function useMarkerData(props: DistributionMarkerDataProps) {
  const {
    data: markerData,
    error,
    isFetching,
    isPreviousData,
  } = useDistributionMarkerData(props);

  if (markerData == null) return { error, isFetching };

  const { mapElements, legendItems, overlayConfig, boundsZoomLevel } =
    markerData;

  const vocabulary =
    overlayConfig.overlayType === 'categorical' // switch statement style guide time!!
      ? overlayConfig.overlayValues
      : overlayConfig.overlayType === 'continuous'
      ? overlayConfig.overlayValues.map((ov) =>
          typeof ov === 'object' ? ov.binLabel : ''
        )
      : undefined;

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const markerProps = processRawMarkersData(
    mapElements,
    vocabulary,
    overlayConfig.overlayType
  );

  return {
    error,
    isFetching: isFetching || isPreviousData,
    markerProps,
    legendItems,
    overlayConfig,
    boundsZoomLevel,
  };
}

const processRawMarkersData = (
  mapElements: StandaloneMapMarkersResponse['mapElements'],
  vocabulary?: string[],
  overlayType?: 'categorical' | 'continuous'
): DonutMarkerProps[] => {
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
          ? overlayValues.map(({ binLabel, value }) => ({
              label: binLabel,
              value: value,
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

      return {
        data: reorderedData,
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
        duration: defaultAnimationDuration,
        markerLabel: kFormatter(count),
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
