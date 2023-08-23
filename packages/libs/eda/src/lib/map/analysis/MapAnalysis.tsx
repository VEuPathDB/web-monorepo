import { useCallback, useMemo, useState } from 'react';

import {
  AnalysisState,
  DEFAULT_ANALYSIS_NAME,
  EntityDiagram,
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
import { filtersFromBoundingBox } from '../../core/utils/visualization';
import { EditLocation, InfoOutlined, Notes, Share } from '@material-ui/icons';
import { ComputationAppOverview } from '../../core/types/visualization';
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
  BarPlotMarker,
  DonutMarker,
  BubbleMarker,
} from './MarkerConfiguration/icons';
import { leastAncestralEntity } from '../../core/utils/data-element-constraints';
import { AllAnalyses } from '../../workspace/AllAnalyses';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { isSavedAnalysis } from '../../core/utils/analysis';
import { GeoConfig } from '../../core/types/geoConfig';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { SidePanelItem, SidePanelMenuEntry } from './Types';
import { SideNavigationItems } from './MapSideNavigation';
import {
  barMarkerPlugin,
  bubbleMarkerPlugin,
  donutMarkerPlugin,
} from './mapTypes';

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
    setSideNavigationIsExpanded(true);
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
            sideNavigationIsExpanded &&
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
                return (
                  <donutMarkerPlugin.ConfigPanelComponent
                    apps={apps}
                    analysisState={analysisState}
                    appState={appState}
                    studyId={studyId}
                    filters={filters}
                    studyEntities={studyEntities}
                    geoConfigs={geoConfigs}
                    configuration={activeMarkerConfiguration}
                    updateConfiguration={updateMarkerConfigurations as any}
                  />
                );
              },
            },
            {
              type: 'item',
              id: 'single-variable-bar',
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
                return (
                  <barMarkerPlugin.ConfigPanelComponent
                    apps={apps}
                    analysisState={analysisState}
                    appState={appState}
                    studyId={studyId}
                    filters={filters}
                    studyEntities={studyEntities}
                    geoConfigs={geoConfigs}
                    configuration={activeMarkerConfiguration}
                    updateConfiguration={updateMarkerConfigurations as any}
                  />
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
                return (
                  <bubbleMarkerPlugin.ConfigPanelComponent
                    apps={apps}
                    analysisState={analysisState}
                    appState={appState}
                    studyId={studyId}
                    filters={filters}
                    studyEntities={studyEntities}
                    geoConfigs={geoConfigs}
                    configuration={activeMarkerConfiguration}
                    updateConfiguration={updateMarkerConfigurations as any}
                  />
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
  const [activeSideMenuId, setActiveSideMenuId] =
    useState<string | undefined>();

  const [sideNavigationIsExpanded, setSideNavigationIsExpanded] =
    useState<boolean>(true);

  // // for flyTo functionality
  // const [willFlyTo, setWillFlyTo] = useState(false);

  // // Only decide if we need to flyTo while we are waiting for marker data
  // // then only trigger the flyTo when no longer pending.
  // // This makes sure that the user sees the global location of the data before the flyTo happens.
  // useEffect(() => {
  //   if (pending) {
  //     // set a safe margin (epsilon) to perform flyTo correctly due to an issue of map resolution etc.
  //     // not necessarily need to use defaultAppState.viewport.center [0, 0] here but used it just in case
  //     const epsilon = 2.0;
  //     const isWillFlyTo =
  //       appState.viewport.zoom === defaultViewport.zoom &&
  //       Math.abs(appState.viewport.center[0] - defaultViewport.center[0]) <=
  //         epsilon &&
  //       Math.abs(appState.viewport.center[1] - defaultViewport.center[1]) <=
  //         epsilon;
  //     setWillFlyTo(isWillFlyTo);
  //   }
  // }, [pending, appState.viewport]);

  const activeMapTypePlugin =
    activeMarkerConfiguration?.type === 'barplot'
      ? barMarkerPlugin
      : activeMarkerConfiguration?.type === 'bubble'
      ? bubbleMarkerPlugin
      : activeMarkerConfiguration?.type === 'pie'
      ? donutMarkerPlugin
      : undefined;

  const activeMapTypeData = usePromise(
    useCallback(async () => {
      if (appsPromiseState.value == null) return;
      return activeMapTypePlugin?.getData({
        analysisState,
        appState,
        apps: appsPromiseState.value,
        configuration: activeMarkerConfiguration,
        dataClient,
        subsettingClient,
        filters,
        geoConfigs,
        studyEntities,
        studyId,
        updateConfiguration: updateMarkerConfigurations as any,
      });
    }, [
      appsPromiseState.value,
      activeMapTypePlugin,
      analysisState,
      appState,
      activeMarkerConfiguration,
      dataClient,
      subsettingClient,
      filters,
      geoConfigs,
      studyEntities,
      studyId,
      updateMarkerConfigurations,
    ])
  );

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
                    activeMapTypeData.value
                      ?.totalVisibleWithOverlayEntityCount ??
                    activeMapTypeData.value?.totalVisibleEntityCount
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
                    isExpanded={sideNavigationIsExpanded}
                    onToggleIsExpanded={() =>
                      setSideNavigationIsExpanded((isExpanded) => !isExpanded)
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
                    showSpinner={activeMapTypeData.pending}
                    viewport={appState.viewport}
                    onBoundsChanged={setBoundsZoomLevel}
                    onViewportChanged={setViewport}
                    showGrid={geoConfig?.zoomLevelToAggregationLevel !== null}
                    zoomLevelToGeohashLevel={
                      geoConfig?.zoomLevelToAggregationLevel
                    }
                    // pass defaultViewport & isStandAloneMap props for custom zoom control
                    defaultViewport={defaultViewport}
                  >
                    {activeMapTypePlugin?.MapLayerComponent &&
                      activeMapTypeData.value && (
                        <activeMapTypePlugin.MapLayerComponent
                          apps={apps}
                          analysisState={analysisState}
                          appState={appState}
                          studyId={studyId}
                          filters={filters}
                          studyEntities={studyEntities}
                          geoConfigs={geoConfigs}
                          configuration={activeMarkerConfiguration}
                          updateConfiguration={
                            updateMarkerConfigurations as any
                          }
                          data={activeMapTypeData.value as any}
                          pending={activeMapTypeData.pending}
                          error={activeMapTypeData.error as any}
                          filtersIncludingViewport={filtersIncludingViewport}
                          totalCounts={totalCounts}
                          filteredCounts={filteredCounts}
                        />
                      )}
                  </MapVEuMap>
                </div>

                {activeMapTypePlugin?.MapOverlayComponent &&
                  activeMapTypeData.value && (
                    <activeMapTypePlugin.MapOverlayComponent
                      apps={apps}
                      analysisState={analysisState}
                      appState={appState}
                      studyId={studyId}
                      filters={filters}
                      studyEntities={studyEntities}
                      geoConfigs={geoConfigs}
                      configuration={activeMarkerConfiguration}
                      updateConfiguration={updateMarkerConfigurations as any}
                      data={activeMapTypeData.value as any}
                      pending={activeMapTypeData.pending}
                      error={activeMapTypeData.error as any}
                      filtersIncludingViewport={filtersIncludingViewport}
                      totalCounts={totalCounts}
                      filteredCounts={filteredCounts}
                    />
                  )}

                {activeMapTypeData.error && (
                  <FloatingDiv
                    style={{
                      top: undefined,
                      bottom: 50,
                      left: 100,
                      right: 100,
                    }}
                  >
                    <div>{String(activeMapTypeData.error)}</div>
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
