import React from 'react';
import DonutMarker, {
  DonutMarkerProps,
  DonutMarkerStandalone,
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
import { useCallback, useMemo } from 'react';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../../constants';
import {
  StandaloneMapMarkersResponse,
  Variable,
  useFindEntityAndVariable,
  useSubsettingClient,
} from '../../../../core';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { kFormatter } from '../../../../core/utils/big-number-formatters';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import { filtersFromBoundingBox } from '../../../../core/utils/visualization';
import { DraggableLegendPanel } from '../../DraggableLegendPanel';
import { MapLegend } from '../../MapLegend';
import { sharedStandaloneMarkerProperties } from '../../MarkerConfiguration/CategoricalMarkerPreview';
import {
  PieMarkerConfiguration,
  PieMarkerConfigurationMenu,
} from '../../MarkerConfiguration/PieMarkerConfigurationMenu';
import {
  DistributionMarkerDataProps,
  defaultAnimation,
  isApproxSameViewport,
  useCategoricalValues,
  useDistributionMarkerData,
  useDistributionOverlayConfig,
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
import { MapFloatingErrorDiv } from '../../MapFloatingErrorDiv';
import { MapTypeHeaderCounts } from '../MapTypeHeaderCounts';

const displayName = 'Donuts';

export const plugin: MapTypePlugin = {
  displayName,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
  MapTypeHeaderDetails,
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
  } = props;

  const geoConfig = geoConfigs[0];
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

  const filtersIncludingViewport = useMemo(() => {
    const viewportFilters = appState.boundsZoomLevel
      ? filtersFromBoundingBox(
          appState.boundsZoomLevel.bounds,
          {
            variableId: geoConfig.latitudeVariableId,
            entityId: geoConfig.entity.id,
          },
          {
            variableId: geoConfig.longitudeVariableId,
            entityId: geoConfig.entity.id,
          }
        )
      : [];
    return [...(filters ?? []), ...viewportFilters];
  }, [
    appState.boundsZoomLevel,
    geoConfig.entity.id,
    geoConfig.latitudeVariableId,
    geoConfig.longitudeVariableId,
    filters,
  ]);

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
    filters: filtersIncludingViewport,
    enabled: configuration.selectedCountsOption === 'visible',
  });

  const previewMarkerResult = useMarkerData({
    studyId,
    filters,
    studyEntities,
    geoConfigs,
    boundsZoomLevel: appState.boundsZoomLevel,
    selectedVariable: configuration.selectedVariable,
    binningMethod: configuration.binningMethod,
    selectedValues: configuration.selectedValues,
    valueSpec: 'count',
  });

  const continuousMarkerPreview = useMemo(() => {
    if (
      !previewMarkerResult ||
      !previewMarkerResult.markerProps?.length ||
      !Array.isArray(previewMarkerResult.markerProps[0].data)
    )
      return;
    const initialDataObject = previewMarkerResult.markerProps[0].data.map(
      (data) => ({
        label: data.label,
        value: 0,
        ...(data.color ? { color: data.color } : {}),
      })
    );
    const finalData = previewMarkerResult.markerProps.reduce(
      (prevData, currData) =>
        currData.data.map((data, index) => ({
          label: data.label,
          value: data.value + prevData[index].value,
          ...('color' in prevData[index]
            ? { color: prevData[index].color }
            : 'color' in data
            ? { color: data.color }
            : {}),
        })),
      initialDataObject
    );
    return (
      <DonutMarkerStandalone
        data={finalData}
        markerLabel={kFormatter(finalData.reduce((p, c) => p + c.value, 0))}
        {...sharedStandaloneMarkerProperties}
      />
    );
  }, [previewMarkerResult]);

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
      continuousMarkerPreview={continuousMarkerPreview}
      allFilteredCategoricalValues={allFilteredCategoricalValues.data}
      allVisibleCategoricalValues={allVisibleCategoricalValues.data}
      inputs={[{ name: 'overlayVariable', label: 'Overlay' }]}
      entities={studyEntities}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
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
    (activeVisualizationId?: string) => {
      if (configuration == null) return;
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
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
          mapType="bubble"
          setHideVizInputsAndControls={props.setHideVizInputsAndControls}
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
  const { selectedVariable, binningMethod, selectedValues } =
    props.configuration as PieMarkerConfiguration;
  const markerDataResponse = useMarkerData({
    studyId: props.studyId,
    filters: props.filters,
    studyEntities: props.studyEntities,
    geoConfigs: props.geoConfigs,
    boundsZoomLevel: props.appState.boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    valueSpec: 'count',
  });

  if (markerDataResponse.error)
    return <MapFloatingErrorDiv error={markerDataResponse.error} />;

  const markers = markerDataResponse.markerProps?.map((markerProps) => (
    <DonutMarker {...markerProps} />
  ));
  return (
    <>
      {markerDataResponse.isFetching && <Spinner />}
      {markers && (
        <SemanticMarkers
          markers={markers}
          animation={defaultAnimation}
          flyToMarkers={
            !markerDataResponse.isFetching &&
            isApproxSameViewport(props.appState.viewport, defaultViewport)
          }
          flyToMarkersDelay={2000}
        />
      )}
    </>
  );
}

function MapOverlayComponent(props: MapTypeMapLayerProps) {
  const {
    studyId,
    filters,
    studyEntities,
    geoConfigs,
    appState: { boundsZoomLevel },
    updateConfiguration,
  } = props;
  const {
    selectedVariable,
    selectedValues,
    binningMethod,
    activeVisualizationId,
  } = props.configuration as PieMarkerConfiguration;
  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(selectedVariable) ?? {};
  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      updateConfiguration({
        ...(props.configuration as PieMarkerConfiguration),
        activeVisualizationId,
      });
    },
    [props.configuration, updateConfiguration]
  );

  const data = useMarkerData({
    studyId,
    filters,
    studyEntities,
    geoConfigs,
    boundsZoomLevel,
    binningMethod,
    selectedVariable,
    selectedValues,
    valueSpec: 'count',
  });

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: data.overlayConfig,
  });

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  return (
    <>
      <DraggableLegendPanel
        panelTitle={overlayVariable?.displayName}
        zIndex={3}
      >
        <div style={{ padding: '5px 10px' }}>
          <MapLegend
            isLoading={data.legendItems == null}
            plotLegendProps={{
              type: 'list',
              legendItems: data.legendItems ?? [],
            }}
            showCheckbox={false}
          />
        </div>
      </DraggableLegendPanel>
      <DraggableVisualization
        analysisState={props.analysisState}
        visualizationId={activeVisualizationId}
        setActiveVisualizationId={setActiveVisualizationId}
        apps={props.apps}
        plugins={plugins}
        geoConfigs={props.geoConfigs}
        totalCounts={props.totalCounts}
        filteredCounts={props.filteredCounts}
        toggleStarredVariable={toggleStarredVariable}
        filters={props.filtersIncludingViewport}
        zIndexForStackingContext={2}
        hideInputsAndControls={props.hideVizInputsAndControls}
        setHideInputsAndControls={props.setHideVizInputsAndControls}
      />
    </>
  );
}

function MapTypeHeaderDetails(props: MapTypeMapLayerProps) {
  const { selectedVariable, binningMethod, selectedValues } =
    props.configuration as PieMarkerConfiguration;
  const markerDataResponse = useMarkerData({
    studyId: props.studyId,
    filters: props.filters,
    studyEntities: props.studyEntities,
    geoConfigs: props.geoConfigs,
    boundsZoomLevel: props.appState.boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    valueSpec: 'count',
  });
  return (
    <MapTypeHeaderCounts
      outputEntityId={selectedVariable.entityId}
      totalEntityCount={props.totalCounts.value?.[selectedVariable.entityId]}
      totalEntityInSubsetCount={
        props.filteredCounts.value?.[selectedVariable.entityId]
      }
      visibleEntityCount={markerDataResponse.totalVisibleWithOverlayEntityCount}
    />
  );
}

function useMarkerData(props: DistributionMarkerDataProps) {
  const {
    data: markerData,
    error,
    isFetching,
    isPreviousData,
  } = useDistributionMarkerData(props);

  if (markerData == null) return { error, isFetching };

  const {
    mapElements,
    totalVisibleEntityCount,
    totalVisibleWithOverlayEntityCount,
    legendItems,
    overlayConfig,
    boundsZoomLevel,
  } = markerData;

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
    totalVisibleWithOverlayEntityCount,
    totalVisibleEntityCount,
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