import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import DonutMarker, {
  DonutMarkerProps,
  DonutMarkerStandalone,
} from '@veupathdb/components/lib/map/DonutMarker';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { sumBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../..';
import {
  AllValuesDefinition,
  CategoricalVariableDataShape,
  OverlayConfig,
  StandaloneMapMarkersRequestParams,
  StandaloneMapMarkersResponse,
  Variable,
  useDataClient,
  useFindEntityAndVariable,
  usePromise,
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
import { GLOBAL_VIEWPORT } from '../../hooks/standaloneMapMarkers';
import { getCategoricalValues } from '../../utils/categoricalValues';
import { getDefaultOverlayConfig } from '../../utils/defaultOverlayConfig';
import { defaultAnimation } from '../shared';
import {
  GetDataProps,
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import { leastAncestralEntity } from '../../../../core/utils/data-element-constraints';
import DraggableVisualization from '../../DraggableVisualization';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';
import {
  MapTypeConfigurationMenu,
  MarkerConfigurationOption,
} from '../../MarkerConfiguration/MapTypeConfigurationMenu';
import { DonutMarkersIcon } from '../../MarkerConfiguration/icons';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import MapVizManagement from '../../MapVizManagement';

const displayName = 'Donuts';

interface DonutMakerData {
  markersData: DonutMarkerProps[];
  totalVisibleWithOverlayEntityCount: number;
  totalVisibleEntityCount: number;
  legendItems: LegendItemsProps[];
  overlayConfig: OverlayConfig;
}

export const plugin: MapTypePlugin<DonutMakerData> = {
  displayName,
  getData,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
};

async function getData(props: GetDataProps): Promise<DonutMakerData> {
  const {
    boundsZoomLevel,
    configuration,
    geoConfigs,
    studyId,
    filters,
    studyEntities,
    dataClient,
    subsettingClient,
  } = props;

  const geoConfig = geoConfigs[0];

  if (geoConfig == null) throw new Error('Geoconfig is null');

  const { selectedVariable, binningMethod } =
    configuration as PieMarkerConfiguration;

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
  const outputEntityId = outputEntity?.id;

  // prepare some info that the map-markers and overlay requests both need
  const { latitudeVariable, longitudeVariable } =
    geoConfig == null || geoConfig.entity.id == null
      ? {
          latitudeVariable: undefined,
          longitudeVariable: undefined,
        }
      : {
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

  const geoAggregateVariable =
    geoConfig != null
      ? {
          entityId: geoConfig.entity.id,
          variableId:
            // if boundsZoomLevel is undefined, we'll default to geoConfig.aggregationVariableIds[0]
            geoConfig.aggregationVariableIds[
              boundsZoomLevel?.zoomLevel != null
                ? geoConfig.zoomLevelToAggregationLevel(
                    boundsZoomLevel.zoomLevel
                  ) - 1
                : 0
            ],
        }
      : undefined;

  const overlayConfig = await getDefaultOverlayConfig({
    studyId,
    filters,
    overlayEntity,
    overlayVariable,
    dataClient,
    subsettingClient,
    binningMethod,
  });

  if (overlayConfig == null) {
    throw new Error('Could not get overlay config');
  }

  // check all required vizConfigs are provided
  if (
    geoConfig == null ||
    latitudeVariable == null ||
    longitudeVariable == null ||
    geoAggregateVariable == null ||
    outputEntityId == null
  )
    throw new Error('Oops');

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

  const requestParams: StandaloneMapMarkersRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      overlayConfig: overlayConfig as OverlayConfig,
      outputEntityId,
      valueSpec: 'count',
      viewport,
    },
  };

  const rawMarkersData = await dataClient.getStandaloneMapMarkers(
    'standalone-map',
    requestParams
  );
  const vocabulary =
    overlayConfig.overlayType === 'categorical' // switch statement style guide time!!
      ? overlayConfig.overlayValues
      : overlayConfig.overlayType === 'continuous'
      ? overlayConfig.overlayValues.map((ov) =>
          typeof ov === 'object' ? ov.binLabel : ''
        )
      : undefined;

  const totalVisibleEntityCount = rawMarkersData.mapElements.reduce(
    (acc, curr) => {
      return acc + curr.entityCount;
    },
    0
  );

  const countSum = sumBy(rawMarkersData.mapElements, 'entityCount');

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const finalMarkersData = processRawMarkersData(
    rawMarkersData.mapElements,
    vocabulary,
    overlayConfig.overlayType
  );

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
      hasData: rawMarkersData.mapElements.some(
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
    markersData: finalMarkersData,
    totalVisibleWithOverlayEntityCount: countSum,
    totalVisibleEntityCount,
    legendItems,
    overlayConfig,
  };
}

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
  const configuration = props.configuration as PieMarkerConfiguration;
  const { selectedVariable, binningMethod } = configuration;

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

  const allFilteredCategoricalValues = usePromise(
    useCallback(async (): Promise<AllValuesDefinition[] | undefined> => {
      /**
       * We only need this data for categorical vars, so we can return early if var isn't categorical
       */
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
    }, [overlayEntity, overlayVariable, subsettingClient, studyId, filters])
  );

  const allVisibleCategoricalValues = usePromise(
    useCallback(async (): Promise<AllValuesDefinition[] | undefined> => {
      /**
       * Return early if:
       *  - overlay var isn't categorical
       *  - "Show counts for" toggle isn't set to 'visible'
       */
      if (
        !overlayVariable ||
        !CategoricalVariableDataShape.is(overlayVariable.dataShape) ||
        (configuration as PieMarkerConfiguration).selectedCountsOption !==
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
    }, [
      overlayVariable,
      configuration,
      overlayEntity,
      subsettingClient,
      studyId,
      filtersIncludingViewport,
    ])
  );

  const previewMarkerResult = usePromise(
    useCallback(
      async () =>
        appState.boundsZoomLevel
          ? getData({
              dataClient,
              subsettingClient,
              boundsZoomLevel: appState.boundsZoomLevel,
              studyId,
              filters,
              studyEntities,
              geoConfigs,
              configuration,
            })
          : undefined,
      [
        appState.boundsZoomLevel,
        configuration,
        dataClient,
        filters,
        geoConfigs,
        studyEntities,
        studyId,
        subsettingClient,
      ]
    )
  );

  const continuousMarkerPreview = useMemo(() => {
    if (
      !previewMarkerResult.value ||
      !previewMarkerResult.value.markersData.length ||
      !Array.isArray(previewMarkerResult.value.markersData[0].data)
    )
      return;
    const initialDataObject = previewMarkerResult.value.markersData[0].data.map(
      (data) => ({
        label: data.label,
        value: 0,
        ...(data.color ? { color: data.color } : {}),
      })
    );
    const finalData = previewMarkerResult.value.markersData.reduce(
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
  }, [previewMarkerResult.value]);

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
    <PieMarkerConfigurationMenu
      onChange={updateConfiguration}
      configuration={configuration as PieMarkerConfiguration}
      constraints={markerVariableConstraints}
      overlayConfiguration={overlayConfiguration.value}
      overlayVariable={overlayVariable}
      subsettingClient={subsettingClient}
      studyId={studyId}
      filters={filters}
      continuousMarkerPreview={continuousMarkerPreview}
      allFilteredCategoricalValues={allFilteredCategoricalValues.value}
      allVisibleCategoricalValues={allVisibleCategoricalValues.value}
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
    selectedOverlayConfig: overlayConfiguration.value,
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

function MapLayerComponent(props: MapTypeMapLayerProps<DonutMakerData>) {
  const markers = props.data.markersData.map((markerProps) => (
    <DonutMarker {...markerProps} />
  ));
  return <SemanticMarkers markers={markers} animation={defaultAnimation} />;
}

function MapOverlayComponent(props: MapTypeMapLayerProps<DonutMakerData>) {
  const { data, updateConfiguration } = props;
  const configuration = props.configuration as PieMarkerConfiguration;
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
            isLoading={data.legendItems.length === 0}
            plotLegendProps={{ type: 'list', legendItems: data.legendItems }}
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

      const commonMarkerProps = {
        data: reorderedData,
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
        duration: defaultAnimationDuration,
      };

      return {
        ...commonMarkerProps,
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
