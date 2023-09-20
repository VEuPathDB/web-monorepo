import React, { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CategoricalVariableDataShape,
  Variable,
} from '../../../../core/types/study';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import {
  BarPlotMarkerConfiguration,
  BarPlotMarkerConfigurationMenu,
} from '../../MarkerConfiguration/BarPlotMarkerConfigurationMenu';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import {
  DefaultOverlayConfigProps,
  getDefaultOverlayConfig,
} from '../../utils/defaultOverlayConfig';
import {
  LatLonViewport,
  OverlayConfig,
  StandaloneMapMarkersResponse,
} from '../../../../core/api/DataClient/types';
import { getDefaultAxisRange } from '../../../../core/utils/computeDefaultAxisRange';
import { NumberRange } from '@veupathdb/components/lib/types/general';
import { mFormatter } from '../../../../core/utils/big-number-formatters';
import ChartMarker, {
  ChartMarkerProps,
  ChartMarkerStandalone,
} from '@veupathdb/components/lib/map/ChartMarker';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../..';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { defaultAnimation, useCommonData } from '../shared';
import {
  useDataClient,
  useFindEntityAndVariable,
  useSubsettingClient,
} from '../../../../core/hooks/workspace';
import { DraggableLegendPanel } from '../../DraggableLegendPanel';
import { MapLegend } from '../../MapLegend';
import { filtersFromBoundingBox } from '../../../../core/utils/visualization';
import { Filter, usePromise } from '../../../../core';
import { getCategoricalValues } from '../../utils/categoricalValues';
import { sharedStandaloneMarkerProperties } from '../../MarkerConfiguration/CategoricalMarkerPreview';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import DraggableVisualization from '../../DraggableVisualization';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';
import {
  MapTypeConfigurationMenu,
  MarkerConfigurationOption,
} from '../../MarkerConfiguration/MapTypeConfigurationMenu';
import { BarPlotMarkerIcon } from '../../MarkerConfiguration/icons';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import MapVizManagement from '../../MapVizManagement';
import { VariableDescriptor } from '../../../../core/types/variable';

const displayName = 'Bar plots';

export const plugin: MapTypePlugin<void> = {
  displayName,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
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
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const configuration = props.configuration as BarPlotMarkerConfiguration;
  const { selectedVariable, binningMethod, dependentAxisLogScale } =
    configuration;

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

  const allFilteredCategoricalValues = useQuery({
    queryKey: [
      'barplot',
      'allFilteredCategoricalValues',
      studyId,
      overlayVariable.id,
      overlayEntity.id,
      filters,
    ],
    queryFn: async function getFilteredCategoricalValues() {
      if (
        !overlayVariable ||
        !CategoricalVariableDataShape.is(overlayVariable.dataShape)
      )
        return;
      return getCategoricalValues({
        overlayEntity,
        subsettingClient,
        studyId,
        overlayVariable,
        filters,
      });
    },
  });

  const allVisibleCategoricalValues = useQuery({
    queryKey: [
      'barplot',
      'allVisibleCategoricalValues',
      studyId,
      overlayVariable.id,
      overlayEntity.id,
      filtersIncludingViewport,
    ],
    queryFn: async function getVisibleCategoricalValues() {
      /**
       * Return early if:
       *  - overlay var isn't categorical
       *  - "Show counts for" toggle isn't set to 'visible'
       */
      if (
        !overlayVariable ||
        !CategoricalVariableDataShape.is(overlayVariable.dataShape) ||
        (configuration as BarPlotMarkerConfiguration).selectedCountsOption !==
          'visible'
      )
        return;

      return getCategoricalValues({
        overlayEntity,
        subsettingClient,
        studyId,
        overlayVariable,
        filters: filtersIncludingViewport,
      });
    },
  });

  const {
    outputEntity,
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    viewport,
  } = useCommonData(
    configuration.selectedVariable,
    geoConfigs,
    studyEntities,
    appState.boundsZoomLevel
  );

  const previewMarkerData = useMarkerData({
    studyId: props.studyId,
    filters: props.filters,
    geoAggregateVariable,
    latitudeVariable,
    longitudeVariable,
    outputEntityId: outputEntity?.id,
    overlayVariableDescriptor: configuration.selectedVariable,
    selectedPlotMode: configuration.selectedPlotMode,
    binningMethod: configuration.binningMethod,
    dependentAxisLogScale: configuration.dependentAxisLogScale,
    viewport,
  });

  const continuousMarkerPreview = useMemo(() => {
    if (
      !previewMarkerData ||
      !previewMarkerData.length ||
      !Array.isArray(previewMarkerData[0].data)
    )
      return;
    const initialDataObject = previewMarkerData[0].data.map((data) => ({
      label: data.label,
      value: 0,
      ...(data.color ? { color: data.color } : {}),
    }));
    const finalData = previewMarkerData.reduce(
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
      <ChartMarkerStandalone
        data={finalData}
        markerLabel={mFormatter(finalData.reduce((p, c) => p + c.value, 0))}
        dependentAxisLogScale={dependentAxisLogScale}
        {...sharedStandaloneMarkerProperties}
      />
    );
  }, [dependentAxisLogScale, previewMarkerData]);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const overlayConfiguration = usePromise(
    useCallback(
      () =>
        getDefaultOverlayConfig({
          studyId,
          filters,
          overlayEntity,
          overlayVariable,
          dataClient,
          subsettingClient,
          binningMethod,
        }),
      [
        studyId,
        filters,
        overlayEntity,
        overlayVariable,
        dataClient,
        subsettingClient,
        binningMethod,
      ]
    )
  );

  const markerVariableConstraints = apps
    .find((app) => app.name === 'standalone-map')
    ?.visualizations.find(
      (viz) => viz.name === 'map-markers'
    )?.dataElementConstraints;

  const configurationMenu = (
    <BarPlotMarkerConfigurationMenu
      onChange={updateConfiguration}
      configuration={configuration as BarPlotMarkerConfiguration}
      constraints={markerVariableConstraints}
      overlayConfiguration={overlayConfiguration.value}
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
    type: 'bubble',
    displayName,
    icon: (
      <BarPlotMarkerIcon style={{ height: '1.5em', marginLeft: '0.25em' }} />
    ),
    configurationMenu,
  };

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

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: overlayConfiguration.value,
  });

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

function MapLayerComponent(props: MapTypeMapLayerProps<void>) {
  const {
    geoAggregateVariable,
    latitudeVariable,
    longitudeVariable,
    outputEntity,
    viewport,
  } = useCommonData(
    (props.configuration as BarPlotMarkerConfiguration).selectedVariable,
    props.geoConfigs,
    props.studyEntities,
    props.appState.boundsZoomLevel
  );

  const markerData = useMarkerData({
    studyId: props.studyId,
    filters: props.filters,
    geoAggregateVariable,
    latitudeVariable,
    longitudeVariable,
    outputEntityId: outputEntity.id,
    binningMethod: (props.configuration as BarPlotMarkerConfiguration)
      .binningMethod,
    overlayVariableDescriptor: (
      props.configuration as BarPlotMarkerConfiguration
    ).selectedVariable,
    dependentAxisLogScale: (props.configuration as BarPlotMarkerConfiguration)
      .dependentAxisLogScale,
    viewport,
    selectedPlotMode: (props.configuration as BarPlotMarkerConfiguration)
      .selectedPlotMode,
  });

  const markers =
    markerData?.map((markerProps) => <ChartMarker {...markerProps} />) ?? [];

  return <SemanticMarkers markers={markers} animation={defaultAnimation} />;
}

function MapOverlayComponent(props: MapTypeMapLayerProps<void>) {
  const { updateConfiguration } = props;
  const configuration = props.configuration as BarPlotMarkerConfiguration;
  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(configuration.selectedVariable) ?? {};

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
      });
    },
    [configuration, updateConfiguration]
  );

  const {
    outputEntity,
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    viewport,
  } = useCommonData(
    configuration.selectedVariable,
    props.geoConfigs,
    props.studyEntities,
    props.appState.boundsZoomLevel
  );

  const { data: overlayConfig } = useOverlayConfig({
    studyId: props.studyId,
    filters: props.filters,
    binningMethod: configuration.binningMethod,
    overlayVariableDescriptor: configuration.selectedVariable,
  });

  const markerData = useMarkerData({
    studyId: props.studyId,
    filters: props.filters,
    geoAggregateVariable,
    latitudeVariable,
    longitudeVariable,
    outputEntityId: outputEntity?.id,
    overlayVariableDescriptor: configuration.selectedVariable,
    selectedPlotMode: configuration.selectedPlotMode,
    binningMethod: configuration.binningMethod,
    dependentAxisLogScale: configuration.dependentAxisLogScale,
    viewport,
  });

  const vocabulary: string[] = overlayConfig
    ? getVocabulary(overlayConfig)
    : [];

  const legendItems = vocabulary.map(
    (label): LegendItemsProps => ({
      label: fixLabelForOtherValues(label),
      marker: 'square',
      markerColor:
        overlayConfig?.overlayType === 'categorical'
          ? ColorPaletteDefault[vocabulary.indexOf(label)]
          : overlayConfig?.overlayType === 'continuous'
          ? gradientSequentialColorscaleMap(
              vocabulary.length > 1
                ? vocabulary.indexOf(label) / (vocabulary.length - 1)
                : 0.5
            )
          : undefined,
      // has any geo-facet got an array of overlay data
      // containing at least one element that satisfies label==label
      hasData:
        markerData?.some((el) => el.data.some((d) => d.label === label)) ??
        true,
      group: 1,
      rank: 1,
    })
  );

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: overlayConfig,
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
            isLoading={legendItems.length === 0}
            plotLegendProps={{ type: 'list', legendItems }}
            showCheckbox={false}
          />
        </div>
      </DraggableLegendPanel>
      <DraggableVisualization
        analysisState={props.analysisState}
        visualizationId={configuration.activeVisualizationId}
        setActiveVisualizationId={setActiveVisualizationId}
        apps={props.apps}
        plugins={plugins}
        geoConfigs={props.geoConfigs}
        totalCounts={props.totalCounts}
        filteredCounts={props.filteredCounts}
        toggleStarredVariable={toggleStarredVariable}
        filters={props.filtersIncludingViewport}
        // onTouch={moveVizToTop}
        zIndexForStackingContext={2}
      />
    </>
  );
}

const processRawMarkersData = (
  mapElements: StandaloneMapMarkersResponse['mapElements'],
  defaultDependentAxisRange: NumberRange,
  dependentAxisLogScale: boolean,
  vocabulary?: string[],
  overlayType?: 'categorical' | 'continuous'
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
        markerLabel: mFormatter(count),
        dependentAxisRange: defaultDependentAxisRange,
        dependentAxisLogScale,
      } as ChartMarkerProps;
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

interface OverlayConfigProps {
  studyId: string;
  filters?: Filter[];
  overlayVariableDescriptor: VariableDescriptor;
  binningMethod: DefaultOverlayConfigProps['binningMethod'];
}

function useOverlayConfig(props: OverlayConfigProps) {
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  return useQuery({
    queryKey: ['barplotOverlayConfig', props],
    queryFn: async function getOverlayConfig() {
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

interface MarkerProps {
  studyId: string;
  filters?: Filter[];
  geoAggregateVariable: VariableDescriptor;
  overlayVariableDescriptor: VariableDescriptor;
  latitudeVariable: VariableDescriptor;
  longitudeVariable: VariableDescriptor;
  binningMethod: DefaultOverlayConfigProps['binningMethod'];
  outputEntityId: string;
  selectedPlotMode: 'count' | 'proportion';
  viewport: LatLonViewport;
  dependentAxisLogScale: boolean;
}
function useMarkerData(props: MarkerProps) {
  const dataClient = useDataClient();
  const { data: overlayConfig, isSuccess: overlayIsSuccess } = useOverlayConfig(
    {
      studyId: props.studyId,
      filters: props.filters,
      overlayVariableDescriptor: props.overlayVariableDescriptor,
      binningMethod: props.binningMethod,
    }
  );
  const { data: markerData } = useQuery({
    queryKey: ['barplotMarkerData', props],
    queryFn: async function getMarkerData() {
      return dataClient.getStandaloneMapMarkers('standalone-map', {
        studyId: props.studyId,
        filters: props.filters ?? [],
        config: {
          geoAggregateVariable: props.geoAggregateVariable,
          latitudeVariable: props.latitudeVariable,
          longitudeVariable: props.longitudeVariable,
          overlayConfig: overlayConfig,
          outputEntityId: props.outputEntityId,
          valueSpec: props.selectedPlotMode,
          viewport: props.viewport,
        },
      });
    },
    enabled: overlayIsSuccess,
  });

  if (markerData == null || overlayConfig == null) return;

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
  const { valueMax, valueMinPos } = markerData.mapElements
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
  return processRawMarkersData(
    markerData.mapElements,
    defaultDependentAxisRange,
    props.dependentAxisLogScale,
    getVocabulary(overlayConfig),
    overlayConfig.overlayType
  );
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
