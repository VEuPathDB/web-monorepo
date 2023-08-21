import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AllValuesDefinition,
  AnalysisState,
  BubbleOverlayConfig,
  CategoricalVariableDataShape,
  DEFAULT_ANALYSIS_NAME,
  EntityDiagram,
  OverlayConfig,
  PromiseResult,
  useAnalysis,
  useAnalysisClient,
  useDataClient,
  useDownloadClient,
  useFindEntityAndVariable,
  useGetDefaultVariableDescriptor,
  usePromise,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
  useSubsettingClient,
} from '../../core';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { useGeoConfig } from '../../core/hooks/geoConfig';
import { DocumentationContainer } from '../../core/components/docs/DocumentationContainer';
import {
  CheckIcon,
  Download,
  FilledButton,
  Filter as FilterIcon,
  H5,
  Table,
} from '@veupathdb/coreui';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import ShowHideVariableContextProvider from '../../core/utils/show-hide-variable-context';
import { MapLegend } from './MapLegend';
import {
  AppState,
  MarkerConfiguration,
  useAppState,
  defaultViewport,
} from './appState';
import { FloatingDiv } from './FloatingDiv';
import Subsetting from '../../workspace/Subsetting';
import { MapHeader } from './MapHeader';
import FilterChipList from '../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import { MapSidePanel } from './MapSidePanel';
import { SiteInformationProps } from '..';
import MapVizManagement from './MapVizManagement';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { filtersFromBoundingBox } from '../../core/utils/visualization';
import { EditLocation, InfoOutlined, Notes, Share } from '@material-ui/icons';
import { ComputationAppOverview } from '../../core/types/visualization';
import { useStandaloneMapMarkers } from './hooks/standaloneMapMarkers';
import { useStandaloneVizPlugins } from './hooks/standaloneVizPlugins';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import DraggableVisualization from './DraggableVisualization';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import Login from '../../workspace/sharing/Login';
import { useLoginCallbacks } from '../../workspace/sharing/hooks';
import NameAnalysis from '../../workspace/sharing/NameAnalysis';
import NotesTab from '../../workspace/NotesTab';
import ConfirmShareAnalysis from '../../workspace/sharing/ConfirmShareAnalysis';
import { useHistory } from 'react-router';

import { uniq } from 'lodash';
import DownloadTab from '../../workspace/DownloadTab';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  BarPlotMarkerConfigurationMenu,
  PieMarkerConfigurationMenu,
  BubbleMarkerConfigurationMenu,
} from './MarkerConfiguration';
import {
  BarPlotMarker,
  DonutMarker,
  BubbleMarker,
} from './MarkerConfiguration/icons';
import { leastAncestralEntity } from '../../core/utils/data-element-constraints';
import { getDefaultOverlayConfig } from './utils/defaultOverlayConfig';
import { AllAnalyses } from '../../workspace/AllAnalyses';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { isSavedAnalysis } from '../../core/utils/analysis';
import {
  MapTypeConfigurationMenu,
  MarkerConfigurationOption,
} from './MarkerConfiguration/MapTypeConfigurationMenu';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import { GeoConfig } from '../../core/types/geoConfig';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import BubbleMarkerComponent, {
  BubbleMarkerProps,
} from '@veupathdb/components/lib/map/BubbleMarker';
import DonutMarkerComponent, {
  DonutMarkerProps,
  DonutMarkerStandalone,
} from '@veupathdb/components/lib/map/DonutMarker';
import ChartMarkerComponent, {
  ChartMarkerProps,
  ChartMarkerStandalone,
} from '@veupathdb/components/lib/map/ChartMarker';
import { sharedStandaloneMarkerProperties } from './MarkerConfiguration/CategoricalMarkerPreview';
import { mFormatter, kFormatter } from '../../core/utils/big-number-formatters';
import { getCategoricalValues } from './utils/categoricalValues';
import { SidePanelItem, SidePanelMenuEntry } from './Types';
import { SideNavigationItems } from './MapSideNavigation';
import { DraggablePanelCoordinatePair } from '@veupathdb/coreui/lib/components/containers/DraggablePanel';
import _ from 'lodash';

enum MapSideNavItemLabels {
  Download = 'Download',
  Filter = 'Filter',
  Notes = 'Notes',
  Plot = 'Plot',
  Share = 'Share',
  StudyDetails = 'View Study Details',
  MyAnalyses = 'My Analyses',
  ConfigureMap = 'Configure Map',
  SingleVariableMaps = 'Single Variable Maps',
  GroupedVariableMaps = 'Grouped Variable Maps',
}

enum MarkerTypeLabels {
  pie = 'Donuts',
  barplot = 'Bar plots',
  bubble = 'Bubbles',
}

const mapStyle: React.CSSProperties = {
  zIndex: 1,
  pointerEvents: 'auto',
};

export const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

enum DraggablePanelIds {
  LEGEND_PANEL = 'legend',
  VIZ_PANEL = 'viz',
}

interface Props {
  analysisId?: string;
  sharingUrl: string;
  studyId: string;
  siteInformationProps: SiteInformationProps;
}

export function MapAnalysis(props: Props) {
  const analysisState = useAnalysis(props.analysisId, 'pass');
  const appStateAndSetters = useAppState('@@mapApp@@', analysisState);
  const geoConfigs = useGeoConfig(useStudyEntities());
  if (geoConfigs == null || geoConfigs.length === 0)
    return (
      <Banner
        banner={{
          type: 'error',
          message: 'This study does not contain map-specific variables.',
        }}
      />
    );
  if (appStateAndSetters.appState == null) return null;
  return (
    <MapAnalysisImpl
      {...props}
      {...(appStateAndSetters as CompleteAppState)}
      analysisState={analysisState}
      geoConfigs={geoConfigs}
    />
  );
}

type CompleteAppState = ReturnType<typeof useAppState> & {
  appState: AppState;
  analysisState: AnalysisState;
};

interface ImplProps extends Props, CompleteAppState {
  geoConfigs: GeoConfig[];
}

function MapAnalysisImpl(props: ImplProps) {
  const {
    appState,
    analysisState,
    setViewport,
    setBoundsZoomLevel,
    setSubsetVariableAndEntity,
    sharingUrl,
    setIsSidePanelExpanded,
    setIsSubsetPanelOpen = () => {},
    setMarkerConfigurations,
    setActiveMarkerConfigurationType,
    geoConfigs,
  } = props;
  const { activeMarkerConfigurationType, markerConfigurations } = appState;
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyId = studyMetadata.id;
  const studyEntities = useStudyEntities(filters);
  const analysisClient = useAnalysisClient();
  const dataClient = useDataClient();
  const downloadClient = useDownloadClient();
  const subsettingClient = useSubsettingClient();
  const geoConfig = geoConfigs[0];

  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();

  const findEntityAndVariable = useFindEntityAndVariable();

  const activeMarkerConfiguration = markerConfigurations.find(
    (markerConfig) => markerConfig.type === activeMarkerConfigurationType
  );

  const { variable: overlayVariable, entity: overlayEntity } =
    findEntityAndVariable(activeMarkerConfiguration?.selectedVariable) ?? {};

  const outputEntity = useMemo(() => {
    if (geoConfig == null || geoConfig.entity.id == null) return;

    return overlayEntity
      ? leastAncestralEntity([overlayEntity, geoConfig.entity], studyEntities)
      : geoConfig.entity;
  }, [geoConfig, overlayEntity, studyEntities]);

  const updateMarkerConfigurations = useCallback(
    (updatedConfiguration: MarkerConfiguration) => {
      const nextMarkerConfigurations = markerConfigurations.map(
        (configuration) => {
          if (configuration.type === updatedConfiguration.type) {
            return updatedConfiguration;
          }
          return configuration;
        }
      );
      setMarkerConfigurations(nextMarkerConfigurations);
    },
    [markerConfigurations, setMarkerConfigurations]
  );

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      if (activeMarkerConfiguration == null) return;
      updateMarkerConfigurations({
        ...activeMarkerConfiguration,
        activeVisualizationId,
      });
    },
    [activeMarkerConfiguration, updateMarkerConfigurations]
  );

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
    return [
      ...(props.analysisState.analysis?.descriptor.subset.descriptor ?? []),
      ...viewportFilters,
    ];
  }, [
    appState.boundsZoomLevel,
    geoConfig.entity.id,
    geoConfig.latitudeVariableId,
    geoConfig.longitudeVariableId,
    props.analysisState.analysis?.descriptor.subset.descriptor,
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
        (activeMarkerConfiguration &&
          'selectedCountsOption' in activeMarkerConfiguration &&
          activeMarkerConfiguration.selectedCountsOption !== 'visible')
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
      activeMarkerConfiguration,
      overlayEntity,
      subsettingClient,
      studyId,
      filtersIncludingViewport,
    ])
  );

  // If the variable or filters have changed on the active marker config
  // get the default overlay config.
  const activeOverlayConfig = usePromise(
    useCallback(async (): Promise<
      OverlayConfig | BubbleOverlayConfig | undefined
    > => {
      // Use `selectedValues` to generate the overlay config for categorical variables
      if (
        activeMarkerConfiguration &&
        'selectedValues' in activeMarkerConfiguration &&
        activeMarkerConfiguration.selectedValues &&
        CategoricalVariableDataShape.is(overlayVariable?.dataShape)
      ) {
        return {
          overlayType: 'categorical',
          overlayVariable: {
            variableId: overlayVariable?.id,
            entityId: overlayEntity?.id,
          },
          overlayValues: activeMarkerConfiguration.selectedValues,
        } as OverlayConfig;
      }

      return getDefaultOverlayConfig({
        studyId,
        filters,
        overlayVariable,
        overlayEntity,
        dataClient,
        subsettingClient,
        markerType: activeMarkerConfiguration?.type,
        binningMethod: _.get(activeMarkerConfiguration, 'binningMethod'),
        aggregator: _.get(activeMarkerConfiguration, 'aggregator'),
        numeratorValues: _.get(activeMarkerConfiguration, 'numeratorValues'),
        denominatorValues: _.get(
          activeMarkerConfiguration,
          'denominatorValues'
        ),
      });
    }, [
      activeMarkerConfiguration,
      overlayVariable,
      studyId,
      filters,
      overlayEntity,
      dataClient,
      subsettingClient,
    ])
  );

  // needs to be pie, count or proportion
  const markerType = (() => {
    switch (activeMarkerConfiguration?.type) {
      case 'barplot': {
        return activeMarkerConfiguration?.selectedPlotMode; // count or proportion
      }
      case 'bubble':
        return 'bubble';
      case 'pie':
      default:
        return 'pie';
    }
  })();

  const {
    markersData,
    pending,
    error,
    legendItems,
    bubbleLegendData,
    bubbleValueToDiameterMapper,
    bubbleValueToColorMapper,
    totalVisibleEntityCount,
    totalVisibleWithOverlayEntityCount,
  } = useStandaloneMapMarkers({
    boundsZoomLevel: appState.boundsZoomLevel,
    geoConfig: geoConfig,
    studyId,
    filters,
    markerType,
    selectedOverlayVariable: activeMarkerConfiguration?.selectedVariable,
    overlayConfig: activeOverlayConfig.value,
    outputEntityId: outputEntity?.id,
    dependentAxisLogScale:
      activeMarkerConfiguration &&
      'dependentAxisLogScale' in activeMarkerConfiguration
        ? activeMarkerConfiguration.dependentAxisLogScale
        : false,
  });

  const { markersData: previewMarkerData } = useStandaloneMapMarkers({
    boundsZoomLevel: undefined,
    geoConfig: geoConfig,
    studyId,
    filters,
    markerType,
    selectedOverlayVariable: activeMarkerConfiguration?.selectedVariable,
    overlayConfig: activeOverlayConfig.value,
    outputEntityId: outputEntity?.id,
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
    const typedData =
      markerType === 'pie'
        ? ([...previewMarkerData] as DonutMarkerProps[])
        : ([...previewMarkerData] as ChartMarkerProps[]);
    const finalData = typedData.reduce(
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
    if (markerType === 'pie') {
      return (
        <DonutMarkerStandalone
          data={finalData}
          markerLabel={kFormatter(finalData.reduce((p, c) => p + c.value, 0))}
          {...sharedStandaloneMarkerProperties}
        />
      );
    } else {
      return (
        <ChartMarkerStandalone
          data={finalData}
          markerLabel={mFormatter(finalData.reduce((p, c) => p + c.value, 0))}
          dependentAxisLogScale={
            activeMarkerConfiguration &&
            'dependentAxisLogScale' in activeMarkerConfiguration
              ? activeMarkerConfiguration.dependentAxisLogScale
              : false
          }
          {...sharedStandaloneMarkerProperties}
        />
      );
    }
  }, [activeMarkerConfiguration, markerType, previewMarkerData]);

  const markers = useMemo(
    () =>
      markersData?.map((markerProps) =>
        markerType === 'pie' ? (
          <DonutMarkerComponent {...(markerProps as DonutMarkerProps)} />
        ) : markerType === 'bubble' ? (
          <BubbleMarkerComponent {...(markerProps as BubbleMarkerProps)} />
        ) : (
          <ChartMarkerComponent {...(markerProps as ChartMarkerProps)} />
        )
      ) || [],
    [markersData, markerType]
  );

  const userLoggedIn = useWdkService(async (wdkService) => {
    const user = await wdkService.getCurrentUser();
    return !user.isGuest;
  });

  const history = useHistory();
  function showLoginForm() {
    const currentUrl = window.location.href;
    const loginUrl = `${props.siteInformationProps.loginUrl}?destination=${currentUrl}`;
    history.push(loginUrl);
  }

  function toggleVisible() {
    setActiveSideMenuId(undefined);
  }

  const loginCallbacks = useLoginCallbacks({ showLoginForm, toggleVisible });

  const appsPromiseState = usePromise(
    useCallback(async () => {
      const { apps } = await dataClient.getApps();
      return apps; // return all apps; new viz picker will only show those with client plugins defined
    }, [dataClient])
  );

  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: activeOverlayConfig.value,
  });

  const subsetVariableAndEntity = useMemo(() => {
    return appState.subsetVariableAndEntity ?? getDefaultVariableDescriptor();
  }, [appState.subsetVariableAndEntity, getDefaultVariableDescriptor]);

  const outputEntityTotalCount =
    totalCounts.value && outputEntity ? totalCounts.value[outputEntity.id] : 0;

  const outputEntityFilteredCount =
    filteredCounts.value && outputEntity
      ? filteredCounts.value[outputEntity.id]
      : 0;

  function openSubsetPanelFromControlOutsideOfNavigation() {
    setIsSubsetPanelOpen(true);
    setActiveSideMenuId(MapSideNavItemLabels.Filter);
    setIsSidePanelExpanded(true);
  }

  const FilterChipListForHeader = () => {
    if (!studyEntities || !filters) return <></>;

    const filterChipConfig: VariableLinkConfig = {
      type: 'button',
      onClick(value) {
        setSubsetVariableAndEntity(value);
        openSubsetPanelFromControlOutsideOfNavigation();
      },
    };

    return (
      <div
        style={{
          // These styles format the "Show X Filters" and filter chips
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 30,
        }}
        className="FilterChips"
      >
        <FilledButton
          disabled={
            // You don't need this button if whenever the filter
            // section is active and expanded.
            appState.isSidePanelExpanded &&
            activeSideMenuId === MapSideNavItemLabels.Filter
          }
          themeRole="primary"
          text="Add filters"
          onPress={openSubsetPanelFromControlOutsideOfNavigation}
          size="small"
          textTransform="unset"
          styleOverrides={{
            container: {
              width: 'max-content',
              marginBottom: '5px',
            },
          }}
        />
        <div style={{ margin: '0 10px' }}>
          <FilterChipList
            filters={filters}
            removeFilter={(filter) =>
              analysisState.analysis &&
              analysisState.setFilters(
                analysisState.analysis.descriptor.subset.descriptor.filter(
                  (f) => f !== filter
                )
              )
            }
            variableLinkConfig={filterChipConfig}
            entities={studyEntities}
            selectedEntityId={subsetVariableAndEntity.entityId}
            selectedVariableId={subsetVariableAndEntity.variableId}
          />
        </div>
      </div>
    );
  };

  const filteredEntities = uniq(filters?.map((f) => f.entityId));

  const sidePanelMenuEntries: SidePanelMenuEntry[] = [
    {
      type: 'heading',
      labelText: MapSideNavItemLabels.ConfigureMap,
      leftIcon: <EditLocation />,
      children: [
        {
          type: 'subheading',
          labelText: MapSideNavItemLabels.SingleVariableMaps,
          children: [
            {
              type: 'item',
              id: 'single-variable-pie',
              labelText: MarkerTypeLabels.pie,
              rightIcon: <DonutMarker style={{ height: '1.25em' }} />,
              leftIcon:
                activeMarkerConfigurationType === 'pie' ? <CheckIcon /> : null,
              onActive: () => {
                setActiveMarkerConfigurationType('pie');
              },
              renderSidePanelDrawer(apps) {
                const markerVariableConstraints = apps
                  .find((app) => app.name === 'standalone-map')
                  ?.visualizations.find(
                    (viz) => viz.name === 'map-markers'
                  )?.dataElementConstraints;
                const overlayConfig = OverlayConfig.is(
                  activeOverlayConfig.value
                )
                  ? activeOverlayConfig.value
                  : undefined;

                const markerConfiguration: MarkerConfigurationOption = {
                  type: 'pie',
                  displayName: MarkerTypeLabels.pie,
                  icon: (
                    <DonutMarker
                      style={{ height: '1.5em', marginLeft: '0.25em' }}
                    />
                  ),
                  configurationMenu:
                    activeMarkerConfiguration?.type === 'pie' ? (
                      <PieMarkerConfigurationMenu
                        inputs={[{ name: 'overlayVariable', label: 'Overlay' }]}
                        entities={studyEntities}
                        onChange={updateMarkerConfigurations}
                        configuration={activeMarkerConfiguration}
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                        constraints={markerVariableConstraints}
                        overlayConfiguration={overlayConfig}
                        overlayVariable={overlayVariable}
                        subsettingClient={subsettingClient}
                        studyId={studyId}
                        filters={filters}
                        allFilteredCategoricalValues={
                          allFilteredCategoricalValues.value
                        }
                        allVisibleCategoricalValues={
                          allVisibleCategoricalValues.value
                        }
                        continuousMarkerPreview={continuousMarkerPreview}
                      />
                    ) : (
                      <></>
                    ),
                };

                const mapTypeConfigurationMenuTabs: TabbedDisplayProps<
                  'markers' | 'plots'
                >['tabs'] = [
                  {
                    key: 'markers',
                    displayName: 'Markers',
                    content: markerConfiguration.configurationMenu,
                  },
                  {
                    key: 'plots',
                    displayName: 'Supporting Plots',
                    content: (
                      <MapVizManagement
                        analysisState={analysisState}
                        setActiveVisualizationId={setActiveVisualizationId}
                        activeVisualizationId={
                          activeMarkerConfiguration?.activeVisualizationId
                        }
                        apps={apps}
                        plugins={plugins}
                        geoConfigs={geoConfigs}
                        mapType={activeMarkerConfigurationType}
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
                      markerConfiguration={markerConfiguration}
                      mapTypeConfigurationMenuTabs={
                        mapTypeConfigurationMenuTabs
                      }
                    />
                  </div>
                );
              },
            },
            {
              type: 'item',
              id: 'single-variable-barplot',
              labelText: MarkerTypeLabels.barplot,
              leftIcon:
                activeMarkerConfigurationType === 'barplot' ? (
                  <CheckIcon />
                ) : null,
              rightIcon: <BarPlotMarker style={{ height: '1.25em' }} />,
              onActive: () => {
                setActiveMarkerConfigurationType('barplot');
              },
              renderSidePanelDrawer(apps) {
                const markerVariableConstraints = apps
                  .find((app) => app.name === 'standalone-map')
                  ?.visualizations.find(
                    (viz) => viz.name === 'map-markers'
                  )?.dataElementConstraints;
                const overlayConfig = OverlayConfig.is(
                  activeOverlayConfig.value
                )
                  ? activeOverlayConfig.value
                  : undefined;

                const markerConfiguration: MarkerConfigurationOption = {
                  type: 'barplot',
                  displayName: MarkerTypeLabels.barplot,
                  icon: (
                    <BarPlotMarker
                      style={{ height: '1.5em', marginLeft: '0.25em' }}
                    />
                  ),
                  configurationMenu:
                    activeMarkerConfiguration?.type === 'barplot' ? (
                      <BarPlotMarkerConfigurationMenu
                        inputs={[{ name: 'overlayVariable', label: 'Overlay' }]}
                        entities={studyEntities}
                        onChange={updateMarkerConfigurations}
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                        configuration={activeMarkerConfiguration}
                        constraints={markerVariableConstraints}
                        overlayConfiguration={overlayConfig}
                        overlayVariable={overlayVariable}
                        subsettingClient={subsettingClient}
                        studyId={studyId}
                        filters={filters}
                        allFilteredCategoricalValues={
                          allFilteredCategoricalValues.value
                        }
                        allVisibleCategoricalValues={
                          allVisibleCategoricalValues.value
                        }
                        continuousMarkerPreview={continuousMarkerPreview}
                      />
                    ) : (
                      <></>
                    ),
                };

                const mapTypeConfigurationMenuTabs: TabbedDisplayProps<
                  'markers' | 'plots'
                >['tabs'] = [
                  {
                    key: 'markers',
                    displayName: 'Markers',
                    content: markerConfiguration.configurationMenu,
                  },
                  {
                    key: 'plots',
                    displayName: 'Supporting Plots',
                    content: (
                      <MapVizManagement
                        analysisState={analysisState}
                        setActiveVisualizationId={setActiveVisualizationId}
                        apps={apps}
                        activeVisualizationId={
                          activeMarkerConfiguration?.activeVisualizationId
                        }
                        plugins={plugins}
                        geoConfigs={geoConfigs}
                        mapType={activeMarkerConfigurationType}
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
                      markerConfiguration={markerConfiguration}
                      mapTypeConfigurationMenuTabs={
                        mapTypeConfigurationMenuTabs
                      }
                    />
                  </div>
                );
              },
            },
            {
              type: 'item',
              id: 'single-variable-bubble',
              labelText: MarkerTypeLabels.bubble,
              rightIcon: <BubbleMarker style={{ height: '1.25em' }} />,
              leftIcon:
                activeMarkerConfigurationType === 'bubble' ? (
                  <CheckIcon />
                ) : null,
              onActive: () => setActiveMarkerConfigurationType('bubble'),
              renderSidePanelDrawer(apps) {
                const markerVariableConstraints = apps
                  .find((app) => app.name === 'standalone-map')
                  ?.visualizations.find(
                    (viz) => viz.name === 'map-markers'
                  )?.dataElementConstraints;

                const markerConfiguration: MarkerConfigurationOption = {
                  type: 'bubble',
                  displayName: MarkerTypeLabels.bubble,
                  icon: (
                    <BubbleMarker
                      style={{ height: '1.5em', marginLeft: '0.25em' }}
                    />
                  ),
                  configurationMenu:
                    activeMarkerConfiguration?.type === 'bubble' ? (
                      <BubbleMarkerConfigurationMenu
                        entities={studyEntities}
                        onChange={updateMarkerConfigurations}
                        configuration={activeMarkerConfiguration}
                        overlayConfiguration={
                          activeOverlayConfig.value &&
                          'aggregationConfig' in activeOverlayConfig.value
                            ? activeOverlayConfig.value
                            : undefined
                        }
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                        constraints={markerVariableConstraints}
                      />
                    ) : (
                      <></>
                    ),
                };

                const mapTypeConfigurationMenuTabs: TabbedDisplayProps<
                  'markers' | 'plots'
                >['tabs'] = [
                  {
                    key: 'markers',
                    displayName: 'Markers',
                    content: markerConfiguration.configurationMenu,
                  },
                  {
                    key: 'plots',
                    displayName: 'Supporting Plots',
                    content: (
                      <MapVizManagement
                        analysisState={analysisState}
                        setActiveVisualizationId={setActiveVisualizationId}
                        apps={apps}
                        activeVisualizationId={
                          activeMarkerConfiguration?.activeVisualizationId
                        }
                        plugins={plugins}
                        geoConfigs={geoConfigs}
                        mapType={activeMarkerConfigurationType}
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
                      markerConfiguration={markerConfiguration}
                      mapTypeConfigurationMenuTabs={
                        mapTypeConfigurationMenuTabs
                      }
                    />
                  </div>
                );
              },
            },
          ],
        },
      ],
    },
    {
      type: 'item',
      id: 'filter',
      labelText: MapSideNavItemLabels.Filter,
      leftIcon: <FilterIcon />,
      renderSidePanelDrawer: () => {
        return (
          <div
            style={{
              width: '70vw',
              maxWidth: 1500,
              maxHeight: 650,
              padding: '0 25px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <EntityDiagram
                expanded
                orientation="horizontal"
                selectedEntity={subsetVariableAndEntity.entityId}
                selectedVariable={subsetVariableAndEntity.variableId}
                entityCounts={totalCounts.value}
                filteredEntityCounts={filteredCounts.value}
                filteredEntities={filteredEntities}
                variableLinkConfig={{
                  type: 'button',
                  onClick: (variableValue) => {
                    setSubsetVariableAndEntity({
                      entityId: variableValue?.entityId,
                      variableId: variableValue?.variableId
                        ? variableValue.variableId
                        : getDefaultVariableDescriptor(variableValue?.entityId)
                            .variableId,
                    });
                  },
                }}
              />
            </div>
            <Subsetting
              variableLinkConfig={{
                type: 'button',
                onClick: setSubsetVariableAndEntity,
              }}
              entityId={subsetVariableAndEntity?.entityId ?? ''}
              variableId={subsetVariableAndEntity.variableId ?? ''}
              analysisState={analysisState}
              totalCounts={totalCounts.value}
              filteredCounts={filteredCounts.value}
              // gets passed to variable tree in order to disable scrollIntoView
              scope="map"
            />
          </div>
        );
      },
    },
    {
      type: 'item',
      id: 'download',
      labelText: MapSideNavItemLabels.Download,
      leftIcon: <Download />,
      renderSidePanelDrawer: () => {
        return (
          <div
            style={{
              padding: '1em',
              width: '70vw',
              maxWidth: '1500px',
            }}
          >
            <DownloadTab
              downloadClient={downloadClient}
              analysisState={analysisState}
              totalCounts={totalCounts.value}
              filteredCounts={filteredCounts.value}
            />
          </div>
        );
      },
    },
    {
      type: 'item',
      id: 'share',
      labelText: MapSideNavItemLabels.Share,
      leftIcon: <Share />,
      renderSidePanelDrawer: () => {
        if (!analysisState.analysis) return null;

        function getShareMenuContent() {
          if (!userLoggedIn) {
            return <Login {...loginCallbacks} showCloseButton={false} />;
          }
          if (analysisState?.analysis?.displayName === DEFAULT_ANALYSIS_NAME) {
            return (
              <NameAnalysis
                currentName={analysisState.analysis.displayName}
                updateName={analysisState.setName}
              />
            );
          }
          return <ConfirmShareAnalysis sharingUrl={sharingUrl} />;
        }

        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 15px',
            }}
          >
            {getShareMenuContent()}
          </div>
        );
      },
    },
    {
      type: 'item',
      id: 'notes',
      labelText: MapSideNavItemLabels.Notes,
      leftIcon: <Notes />,
      renderSidePanelDrawer: () => {
        return (
          <div
            style={{
              padding: '1em',
              width: '70vw',
              maxWidth: '1500px',
            }}
          >
            <NotesTab analysisState={analysisState} />
          </div>
        );
      },
    },
    {
      type: 'item',
      id: 'my-analyses',
      labelText: MapSideNavItemLabels.MyAnalyses,
      leftIcon: <Table />,
      renderSidePanelDrawer: () => {
        return (
          <div
            css={{
              h1: {
                fontSize: '1.75em',
                margin: '25px 0 0 0',
                padding: '0 0 1em 0',
              },
              '.MesaComponent .DataTable': {
                fontSize: 'inherit',
              },
            }}
            style={{
              padding: '1em',
              width: '70vw',
              maxWidth: '1500px',
            }}
          >
            <AllAnalyses
              analysisClient={analysisClient}
              activeAnalysisId={
                isSavedAnalysis(analysisState.analysis)
                  ? analysisState.analysis.analysisId
                  : undefined
              }
              subsettingClient={subsettingClient}
              studyId={getStudyId(studyRecord)}
              showLoginForm={showLoginForm}
            />
          </div>
        );
      },
    },
    {
      type: 'item',
      id: 'study-details',
      labelText: MapSideNavItemLabels.StudyDetails,
      leftIcon: <InfoOutlined />,
      renderSidePanelDrawer: () => {
        return (
          <div
            style={{
              padding: '1em',
              width: '70vw',
              maxWidth: '1500px',
              fontSize: '.95em',
            }}
          >
            <H5 additionalStyles={{ margin: '25px 0 0 0' }}>Study Details</H5>
            <RecordController
              recordClass="dataset"
              primaryKey={studyRecord.id.map((p) => p.value).join('/')}
            />
          </div>
        );
      },
    },
  ];

  function findActiveSidePanelItem(
    entries: SidePanelMenuEntry[] = sidePanelMenuEntries
  ): SidePanelItem | undefined {
    for (const entry of entries) {
      switch (entry.type) {
        case 'heading':
        case 'subheading':
          const activeChild = findActiveSidePanelItem(entry.children);
          if (activeChild) return activeChild;
          break;
        case 'item':
          if (entry.id === activeSideMenuId) {
            return entry;
          }
          break;
      }
    }
  }

  // activeSideMenuId is derived from the label text since labels must be unique in a navigation menu
  const [activeSideMenuId, setActiveSideMenuId] = useState<string | undefined>(
    'single-variable-' + appState.activeMarkerConfigurationType
  );

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  // for flyTo functionality
  const [willFlyTo, setWillFlyTo] = useState(false);

  // Only decide if we need to flyTo while we are waiting for marker data
  // then only trigger the flyTo when no longer pending.
  // This makes sure that the user sees the global location of the data before the flyTo happens.
  useEffect(() => {
    if (pending) {
      // set a safe margin (epsilon) to perform flyTo correctly due to an issue of map resolution etc.
      // not necessarily need to use defaultAppState.viewport.center [0, 0] here but used it just in case
      const epsilon = 2.0;
      const isWillFlyTo =
        appState.viewport.zoom === defaultViewport.zoom &&
        Math.abs(appState.viewport.center[0] - defaultViewport.center[0]) <=
          epsilon &&
        Math.abs(appState.viewport.center[1] - defaultViewport.center[1]) <=
          epsilon;
      setWillFlyTo(isWillFlyTo);
    }
  }, [pending, appState.viewport]);

  const [zIndicies /* setZIndicies */] = useState<DraggablePanelIds[]>(
    Object.values(DraggablePanelIds)
  );

  function getZIndexByPanelTitle(
    requestedPanelTitle: DraggablePanelIds
  ): number {
    const index = zIndicies.findIndex(
      (panelTitle) => panelTitle === requestedPanelTitle
    );
    const zIndexFactor = appState.isSidePanelExpanded ? 2 : 10;
    return index + zIndexFactor;
  }

  const legendZIndex =
    getZIndexByPanelTitle(DraggablePanelIds.LEGEND_PANEL) +
    getZIndexByPanelTitle(DraggablePanelIds.VIZ_PANEL);

  return (
    <PromiseResult state={appsPromiseState}>
      {(apps: ComputationAppOverview[]) => {
        const activePanelItem = findActiveSidePanelItem();
        const activeSideNavigationItemMenu =
          activePanelItem?.renderSidePanelDrawer(apps) ?? null;
        return (
          <ShowHideVariableContextProvider>
            <DocumentationContainer>
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <MapHeader
                  analysisName={analysisState.analysis?.displayName}
                  outputEntity={outputEntity}
                  filterList={<FilterChipListForHeader />}
                  siteInformation={props.siteInformationProps}
                  onAnalysisNameEdit={analysisState.setName}
                  studyName={studyRecord.displayName}
                  totalEntityCount={outputEntityTotalCount}
                  totalEntityInSubsetCount={outputEntityFilteredCount}
                  visibleEntityCount={
                    totalVisibleWithOverlayEntityCount ??
                    totalVisibleEntityCount
                  }
                  overlayActive={overlayVariable != null}
                />
                <div
                  style={{
                    // Make a div that completely fills its parent.
                    height: '100%',
                    width: '100%',
                    // Attach this div container to its parent.
                    position: 'relative',
                    // Remember that just about everything in the DOM is box.
                    // This div is sitting on top of the map. By disabling
                    // pointer events we are saying: hey, div, become porous.
                    // If a user clicks you, don't capture it, but let it go
                    // to the map you're covering.
                    pointerEvents: 'none',
                  }}
                >
                  <MapSidePanel
                    isExpanded={appState.isSidePanelExpanded}
                    onToggleIsExpanded={() =>
                      setIsSidePanelExpanded(!appState.isSidePanelExpanded)
                    }
                    siteInformationProps={props.siteInformationProps}
                    sidePanelDrawerContents={activeSideNavigationItemMenu}
                  >
                    <SideNavigationItems
                      activeSideMenuId={activeSideMenuId}
                      menuEntries={sidePanelMenuEntries}
                      setActiveSideMenuId={setActiveSideMenuId}
                    />
                  </MapSidePanel>
                  <MapVEuMap
                    height="100%"
                    width="100%"
                    style={mapStyle}
                    showLayerSelector={false}
                    showSpinner={pending}
                    animation={defaultAnimation}
                    viewport={appState.viewport}
                    markers={markers}
                    flyToMarkers={
                      markers && markers.length > 0 && willFlyTo && !pending
                    }
                    flyToMarkersDelay={500}
                    onBoundsChanged={setBoundsZoomLevel}
                    onViewportChanged={setViewport}
                    showGrid={geoConfig?.zoomLevelToAggregationLevel !== null}
                    zoomLevelToGeohashLevel={
                      geoConfig?.zoomLevelToAggregationLevel
                    }
                    // pass defaultViewport & isStandAloneMap props for custom zoom control
                    defaultViewport={defaultViewport}
                  />
                </div>

                {markerType !== 'bubble' ? (
                  <DraggableLegendPanel
                    panelTitle={overlayVariable?.displayName}
                    zIndex={legendZIndex}
                  >
                    <div style={{ padding: '5px 10px' }}>
                      <MapLegend
                        isLoading={legendItems.length === 0}
                        plotLegendProps={{ type: 'list', legendItems }}
                        // control to show checkbox. default: true
                        showCheckbox={false}
                      />
                    </div>
                  </DraggableLegendPanel>
                ) : (
                  <>
                    <DraggableLegendPanel
                      panelTitle="Count"
                      zIndex={legendZIndex}
                    >
                      <div style={{ padding: '5px 10px' }}>
                        <MapLegend
                          isLoading={pending}
                          plotLegendProps={{
                            type: 'bubble',
                            legendMax: bubbleLegendData?.maxSizeValue ?? 0,
                            valueToDiameterMapper: bubbleValueToDiameterMapper,
                          }}
                        />
                      </div>
                    </DraggableLegendPanel>
                    <DraggableLegendPanel
                      panelTitle={overlayVariable?.displayName}
                      zIndex={legendZIndex}
                      defaultPosition={{ x: window.innerWidth, y: 420 }}
                    >
                      <div style={{ padding: '5px 10px' }}>
                        <MapLegend
                          isLoading={pending}
                          plotLegendProps={{
                            type: 'colorscale',
                            legendMin: bubbleLegendData?.minColorValue ?? 0,
                            legendMax: bubbleLegendData?.maxColorValue ?? 0,
                            valueToColorMapper:
                              bubbleValueToColorMapper ?? (() => 'white'),
                          }}
                        />
                      </div>
                    </DraggableLegendPanel>
                  </>
                )}

                <DraggableVisualization
                  analysisState={analysisState}
                  visualizationId={
                    activeMarkerConfiguration?.activeVisualizationId
                  }
                  setActiveVisualizationId={setActiveVisualizationId}
                  apps={apps}
                  plugins={plugins}
                  geoConfigs={geoConfigs}
                  totalCounts={totalCounts}
                  filteredCounts={filteredCounts}
                  toggleStarredVariable={toggleStarredVariable}
                  filters={filtersIncludingViewport}
                  // onTouch={moveVizToTop}
                  zIndexForStackingContext={getZIndexByPanelTitle(
                    DraggablePanelIds.VIZ_PANEL
                  )}
                />

                {error && (
                  <FloatingDiv
                    style={{
                      top: undefined,
                      bottom: 50,
                      left: 100,
                      right: 100,
                    }}
                  >
                    <div>{String(error)}</div>
                  </FloatingDiv>
                )}
              </div>
            </DocumentationContainer>
          </ShowHideVariableContextProvider>
        );
      }}
    </PromiseResult>
  );
}

const DraggableLegendPanel = (props: {
  zIndex: number;
  panelTitle?: string;
  defaultPosition?: DraggablePanelCoordinatePair;
  children: React.ReactNode;
}) => (
  <DraggablePanel
    isOpen
    showPanelTitle
    panelTitle={props.panelTitle ?? 'Legend'}
    confineToParentContainer
    defaultPosition={props.defaultPosition ?? { x: window.innerWidth, y: 225 }}
    styleOverrides={{
      zIndex: props.zIndex,
    }}
  >
    {props.children}
  </DraggablePanel>
);
