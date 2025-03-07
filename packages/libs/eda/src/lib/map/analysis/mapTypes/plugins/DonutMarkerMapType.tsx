import DonutMarker, {
  DonutMarkerProps,
} from '@veupathdb/components/lib/map/DonutMarker';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import {
  defaultAnimationDuration,
  defaultViewport,
} from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { useCallback } from 'react';
import {
  STUDIES_ENTITY_ID,
  STUDY_ID_VARIABLE_ID,
  UNSELECTED_DISPLAY_TEXT,
  UNSELECTED_TOKEN,
} from '../../../constants';
import {
  StandaloneMapMarkersResponse,
  Variable,
  useFindEntityAndVariable,
  useSubsettingClient,
} from '../../../../core';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { kFormatter } from '../../../../core/utils/big-number-formatters';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import { DraggableLegendPanel } from '../../DraggableLegendPanel';
import { MapLegend } from '../../MapLegend';
import {
  PieMarkerConfiguration,
  PieMarkerConfigurationMenu,
} from '../../MarkerConfiguration/PieMarkerConfigurationMenu';
import {
  DistributionMarkerDataProps,
  defaultAnimation,
  isApproxSameViewport,
  useCategoricalValues,
  useCommonData,
  useDistributionMarkerData,
  useDistributionOverlayConfig,
  visibleOptionFilterFuncs,
  markerDataFilterFuncs,
  floaterFilterFuncs,
  pieOrBarMarkerConfigLittleFilter,
  viewportLittleFilters,
  timeSliderLittleFilter,
  getErrorOverlayComponent,
  getLegendErrorMessage,
  useSelectedMarkerSnackbars,
  selectedMarkersLittleFilter,
  useFloatingPanelHandlers,
} from '../shared';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import DraggableVisualization from '../../DraggableVisualization';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';
import {
  MapTypeConfigurationMenu,
  MarkerConfigurationOption,
} from '../../MarkerConfiguration/MapTypeConfigurationMenu';
import { DonutMarkersIcon } from '../../MarkerConfiguration/icons';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import MapVizManagement from '../../MapVizManagement';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { MapTypeHeaderStudyDetails } from '../MapTypeHeaderStudyDetails';
import { SubStudies } from '../../SubStudies';
import { useLittleFilters } from '../../littleFilters';
import TimeSliderQuickFilter from '../../TimeSliderQuickFilter';

const displayName = 'Donuts';

export const plugin: MapTypePlugin = {
  displayName,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
  MapTypeHeaderDetails,
  TimeSliderComponent,
};

function ConfigPanelComponent(props: MapTypeConfigPanelProps) {
  const {
    apps,
    analysisState,
    appState,
    geoConfigs,
    updateConfiguration,
    studyId,
    studyEntities,
    filters,
    setIsSidePanelExpanded,
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

  const configurationMenu = (
    <PieMarkerConfigurationMenu
      onChange={updateConfiguration}
      configuration={configuration as PieMarkerConfiguration}
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
      geoConfigs={geoConfigs}
    />
  );

  const markerConfigurationOption: MarkerConfigurationOption = {
    type: 'pie',
    displayName,
    icon: (
      <DonutMarkersIcon style={{ height: '1.5em', marginLeft: '0.25em' }} />
    ),
    configurationMenu,
  };

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: overlayConfiguration.data,
  });

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string, isNew?: boolean) => {
      if (configuration == null) return;
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
        visualizationPanelConfig: {
          ...configuration.visualizationPanelConfig,
          isVisible: !!activeVisualizationId,
          ...(isNew ? { hideVizControl: false } : {}),
        },
      });
    },
    [configuration, updateConfiguration]
  );

  const mapTypeConfigurationMenuTabs: TabbedDisplayProps<
    'markers' | 'plots'
  >['tabs'] = [
    {
      key: 'markers',
      displayName: 'Markers',
      content: configurationMenu,
    },
    {
      key: 'plots',
      displayName: 'Supporting Plots',
      content: (
        <MapVizManagement
          analysisState={analysisState}
          setActiveVisualizationId={setActiveVisualizationId}
          apps={apps}
          activeVisualizationId={configuration.activeVisualizationId}
          plugins={plugins}
          geoConfigs={geoConfigs}
          mapType="pie"
          setIsSidePanelExpanded={setIsSidePanelExpanded}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '1em',
        maxWidth: '1500px',
      }}
    >
      <MapTypeConfigurationMenu
        markerConfiguration={markerConfigurationOption}
        mapTypeConfigurationMenuTabs={mapTypeConfigurationMenuTabs}
      />
    </div>
  );
}

function MapLayerComponent(props: MapTypeMapLayerProps) {
  const {
    studyId,
    studyEntities,
    appState,
    appState: {
      boundsZoomLevel,
      markerConfigurations,
      activeMarkerConfigurationType,
    },
    geoConfigs,
    filters,
    updateConfiguration,
  } = props;

  const configuration = props.configuration as PieMarkerConfiguration;

  const {
    selectedVariable,
    binningMethod,
    selectedValues,
    activeVisualizationId,
  } = configuration;

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
    geoConfigs,
    boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    valueSpec: 'count',
    overlayConfigQueryResult,
  });

  const handleSelectedMarkerSnackbars = useSelectedMarkerSnackbars(
    appState.studyDetailsPanelConfig != null,
    activeVisualizationId
  );

  const setSelectedMarkers = useCallback(
    (selectedMarkers?: string[]) => {
      handleSelectedMarkerSnackbars(selectedMarkers);
      updateConfiguration({
        ...configuration,
        selectedMarkers,
      });
    },
    [configuration, updateConfiguration, handleSelectedMarkerSnackbars]
  );

  // no markers and no error div for certain known error strings
  if (markerDataResponse.error && !markerDataResponse.isFetching)
    return getErrorOverlayComponent(markerDataResponse.error);

  // convert marker data into markers
  const markers = markerDataResponse.markerProps?.map((markerProps) => (
    <DonutMarker {...markerProps} />
  ));

  const selectedMarkers = markerConfigurations.find(
    (markerConfiguration) =>
      markerConfiguration.type === activeMarkerConfigurationType
  )?.selectedMarkers;

  return (
    <>
      {markerDataResponse.isFetching && <Spinner />}
      {markers && (
        <SemanticMarkers
          markers={markers}
          animation={defaultAnimation}
          flyToMarkers={
            !markerDataResponse.isFetching &&
            isApproxSameViewport(appState.viewport, defaultViewport)
          }
          selectedMarkers={selectedMarkers}
          setSelectedMarkers={setSelectedMarkers}
          flyToMarkersDelay={2000}
        />
      )}
    </>
  );
}

function MapOverlayComponent(props: MapTypeMapLayerProps) {
  const {
    studyId,
    studyEntities,
    geoConfigs,
    updateConfiguration,
    appState,
    filters,
    headerButtons,
    setStudyDetailsPanelConfig,
  } = props;

  const configuration = props.configuration as PieMarkerConfiguration;

  const {
    selectedVariable,
    selectedValues,
    binningMethod,
    activeVisualizationId,
    legendPanelConfig,
    visualizationPanelConfig,
    selectedMarkers,
  } = configuration;
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const { variable: overlayVariable } =
    findEntityAndVariable(selectedVariable) ?? {};

  const { filters: filtersForFloaters } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    floaterFilterFuncs
  );

  const { filters: filtersForSubStudies } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    substudyFilterFuncs
  );

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
    geoConfigs,
    binningMethod,
    selectedVariable,
    selectedValues,
    valueSpec: 'count',
    overlayConfigQueryResult,
  });

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: data.overlayConfig,
    selectedMarkers,
  });

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);
  const noDataError = getLegendErrorMessage(data.error);

  const {
    updateLegendPosition,
    updateVisualizationPosition,
    updateVisualizationDimensions,
    onPanelDismiss,
    setHideVizControl,
  } = useFloatingPanelHandlers({ configuration, updateConfiguration });

  return (
    <>
      {appState.studyDetailsPanelConfig?.isVisible && (
        <SubStudies
          studyId={studyId}
          entityId={STUDIES_ENTITY_ID}
          variableId={STUDY_ID_VARIABLE_ID}
          filters={filtersForSubStudies}
          panelConfig={appState.studyDetailsPanelConfig}
          updatePanelConfig={setStudyDetailsPanelConfig}
          hasSelectedMarkers={!!selectedMarkers?.length}
        />
      )}

      <DraggableLegendPanel
        panelTitle={overlayVariable?.displayName}
        zIndex={3}
        headerButtons={headerButtons}
        defaultPosition={legendPanelConfig}
        onDragComplete={updateLegendPosition}
      >
        <div style={{ padding: '5px 10px' }}>
          {noDataError ?? (
            <MapLegend
              isLoading={data.isFetching}
              plotLegendProps={{
                type: 'list',
                legendItems: data.legendItems ?? [],
              }}
              showCheckbox={false}
            />
          )}
        </div>
      </DraggableLegendPanel>
      {visualizationPanelConfig?.isVisible && (
        <DraggableVisualization
          analysisState={props.analysisState}
          visualizationId={activeVisualizationId}
          apps={props.apps}
          plugins={plugins}
          geoConfigs={geoConfigs}
          totalCounts={props.totalCounts}
          filteredCounts={props.filteredCounts}
          toggleStarredVariable={toggleStarredVariable}
          filters={filtersForFloaters}
          zIndexForStackingContext={2}
          hideInputsAndControls={
            visualizationPanelConfig.hideVizControl ?? false
          }
          setHideInputsAndControls={setHideVizControl}
          onDragComplete={updateVisualizationPosition}
          defaultPosition={visualizationPanelConfig.position}
          onPanelResize={updateVisualizationDimensions}
          dimensions={visualizationPanelConfig.dimensions}
          onPanelDismiss={onPanelDismiss}
        />
      )}
    </>
  );
}

function MapTypeHeaderDetails(props: MapTypeMapLayerProps) {
  const {
    studyEntities,
    appState,
    appState: { timeSliderConfig, studyDetailsPanelConfig },
    geoConfigs,
    filters,
  } = props;
  const { selectedVariable, selectedMarkers } =
    props.configuration as PieMarkerConfiguration;

  const { filters: filtersForSubStudies } = useLittleFilters(
    {
      filters,
      appState,
      geoConfigs,
    },
    substudyFilterFuncs
  );

  const {
    outputEntity: { id: outputEntityId },
  } = useCommonData(selectedVariable, geoConfigs, studyEntities);

  return outputEntityId != null ? (
    <MapTypeHeaderStudyDetails
      hasMarkerSelection={!!selectedMarkers?.length}
      filtersForVisibleData={filtersForSubStudies}
      includesTimeSliderFilter={timeSliderConfig != null}
      outputEntityId={outputEntityId}
      onShowStudies={
        studyDetailsPanelConfig &&
        ((isVisible) =>
          props.setStudyDetailsPanelConfig({
            ...studyDetailsPanelConfig,
            isVisible,
          }))
      }
    />
  ) : null;
}

const timeSliderFilterFuncs = [pieOrBarMarkerConfigLittleFilter];
const substudyFilterFuncs = [
  viewportLittleFilters,
  timeSliderLittleFilter,
  pieOrBarMarkerConfigLittleFilter,
  selectedMarkersLittleFilter,
];

export function TimeSliderComponent(props: MapTypeMapLayerProps) {
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

  return timeSliderConfig && setTimeSliderConfig && siteInformationProps ? (
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
