import { useCallback, useMemo, useState } from 'react';

import {
  AnalysisState,
  DEFAULT_ANALYSIS_NAME,
  DateRangeFilter,
  DateVariable,
  EntityDiagram,
  NumberRangeFilter,
  NumberVariable,
  PromiseResult,
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
  Plus,
  FilledButton,
  Filter as FilterIcon,
  FloatingButton,
  H5,
  Table,
} from '@veupathdb/coreui';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import ShowHideVariableContextProvider from '../../core/utils/show-hide-variable-context';
import { AppState, MarkerConfiguration, useAppState } from './appState';
import Subsetting from '../../workspace/Subsetting';
import { MapHeader } from './MapHeader';
import FilterChipList from '../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import { MapSidePanel } from './MapSidePanel';
import { filtersFromBoundingBox } from '../../core/utils/visualization';
import { EditLocation, InfoOutlined, Notes, Share } from '@material-ui/icons';
import { ComputationAppOverview } from '../../core/types/visualization';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import Login from '../../workspace/sharing/Login';
import { useLoginCallbacks } from '../../workspace/sharing/hooks';
import NameAnalysis from '../../workspace/sharing/NameAnalysis';
import NotesTab from '../../workspace/NotesTab';
import ConfirmShareAnalysis from '../../workspace/sharing/ConfirmShareAnalysis';
import { useHistory, useRouteMatch } from 'react-router';

import { uniq } from 'lodash';
import Path from 'path';
import DownloadTab from '../../workspace/DownloadTab';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  BarPlotMarkerIcon,
  DonutMarkerIcon,
  BubbleMarkerIcon,
} from './MarkerConfiguration/icons';
import { AllAnalyses } from '../../workspace/AllAnalyses';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { isSavedAnalysis } from '../../core/utils/analysis';
import { GeoConfig } from '../../core/types/geoConfig';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  SidePanelItem,
  SidePanelMenuEntry,
  SiteInformationProps,
} from './Types';
import { SideNavigationItems } from './MapSideNavigation';
import {
  barMarkerPlugin,
  bubbleMarkerPlugin,
  donutMarkerPlugin,
} from './mapTypes';

import EZTimeFilter from './EZTimeFilter';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { MapTypeMapLayerProps } from './mapTypes/types';
import { defaultViewport } from '@veupathdb/components/lib/map/config/map';
import AnalysisNameDialog from '../../workspace/AnalysisNameDialog';

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
  const appStateAndSetters = useAppState('@@mapApp@@', props.analysisId);
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
    analysisId,
    setViewport,
    setBoundsZoomLevel,
    setSubsetVariableAndEntity,
    // sharingUrl,
    setIsSidePanelExpanded,
    setMarkerConfigurations,
    setActiveMarkerConfigurationType,
    geoConfigs,
    setTimeSliderConfig,
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
  const history = useHistory();
  const [hideVizInputsAndControls, setHideVizInputsAndControls] =
    useState(false);

  // FIXME use the sharingUrl prop to construct this
  const sharingUrl = new URL(`../${analysisId}/import`, window.location.href)
    .href;

  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();

  const findEntityAndVariable = useFindEntityAndVariable();

  const activeMarkerConfiguration = markerConfigurations.find(
    (markerConfig) => markerConfig.type === activeMarkerConfigurationType
  );

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

  const timeFilter: NumberRangeFilter | DateRangeFilter | undefined =
    useMemo(() => {
      if (appState.timeSliderConfig == null) return undefined;

      const { active, variable, selectedRange } = appState.timeSliderConfig;

      const { variable: timeVariableMetadata } =
        findEntityAndVariable(variable) ?? {};

      return active && variable && selectedRange
        ? DateVariable.is(timeVariableMetadata)
          ? {
              type: 'dateRange',
              ...variable,
              min: selectedRange.start + 'T00:00:00Z',
              max: selectedRange.end + 'T00:00:00Z',
            }
          : NumberVariable.is(timeVariableMetadata)
          ? {
              type: 'numberRange', // this is temporary - I think we should NOT handle non-date variables when we roll this out
              ...variable, // TO DO: remove number variable handling
              min: Number(selectedRange.start.split(/-/)[0]), // just take the year number
              max: Number(selectedRange.end.split(/-/)[0]), // from the YYYY-MM-DD returned from the widget
            }
          : undefined
        : undefined;
    }, [appState.timeSliderConfig, findEntityAndVariable]);

  const viewportFilters = useMemo(
    () =>
      appState.boundsZoomLevel
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
        : [],
    [
      appState.boundsZoomLevel,
      geoConfig.entity.id,
      geoConfig.latitudeVariableId,
      geoConfig.longitudeVariableId,
    ]
  );

  // needed for floaters
  const filtersIncludingViewportAndTimeSlider = useMemo(() => {
    return [
      ...(props.analysisState.analysis?.descriptor.subset.descriptor ?? []),
      ...viewportFilters,
      ...(timeFilter != null ? [timeFilter] : []),
    ];
  }, [
    props.analysisState.analysis?.descriptor.subset.descriptor,
    viewportFilters,
    timeFilter,
  ]);

  // needed for markers
  const filtersIncludingTimeSlider = useMemo(() => {
    return [
      ...(props.analysisState.analysis?.descriptor.subset.descriptor ?? []),
      ...(timeFilter != null ? [timeFilter] : []),
    ];
  }, [props.analysisState.analysis?.descriptor.subset.descriptor, timeFilter]);

  const userLoggedIn = useWdkService(async (wdkService) => {
    const user = await wdkService.getCurrentUser();
    return !user.isGuest;
  });

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

  function openSubsetPanelFromControlOutsideOfNavigation() {
    setActiveSideMenuId('filter');
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
            appState.isSidePanelExpanded && activeSideMenuId === 'filter'
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

  const [isAnalysisNameDialogOpen, setIsAnalysisNameDialogOpen] =
    useState(false);
  const { url: urlRouteMatch } = useRouteMatch();
  const redirectURL = studyId
    ? urlRouteMatch.endsWith(studyId)
      ? `/workspace/${urlRouteMatch}/new`
      : Path.resolve(urlRouteMatch, '../new')
    : null;
  const redirectToNewAnalysis = useCallback(() => {
    if (redirectURL) history.push(redirectURL);
  }, [history, redirectURL]);

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
              labelText: donutMarkerPlugin.displayName,
              rightIcon: <DonutMarkerIcon style={{ height: '1.25em' }} />,
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
                    hideVizInputsAndControls={hideVizInputsAndControls}
                    setHideVizInputsAndControls={setHideVizInputsAndControls}
                  />
                );
              },
            },
            {
              type: 'item',
              id: 'single-variable-bar',
              labelText: barMarkerPlugin.displayName,
              leftIcon:
                activeMarkerConfigurationType === 'barplot' ? (
                  <CheckIcon />
                ) : null,
              rightIcon: <BarPlotMarkerIcon style={{ height: '1.25em' }} />,
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
                    hideVizInputsAndControls={hideVizInputsAndControls}
                    setHideVizInputsAndControls={setHideVizInputsAndControls}
                  />
                );
              },
            },
            {
              type: 'item',
              id: 'single-variable-bubble',
              labelText: bubbleMarkerPlugin.displayName,
              rightIcon: <BubbleMarkerIcon style={{ height: '1.25em' }} />,
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
                    hideVizInputsAndControls={hideVizInputsAndControls}
                    setHideVizInputsAndControls={setHideVizInputsAndControls}
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
            {analysisId && redirectToNewAnalysis ? (
              <div style={{ float: 'right' }}>
                <FloatingButton
                  text="Create new analysis"
                  icon={Plus}
                  onPress={
                    analysisState.analysis?.displayName ===
                    DEFAULT_ANALYSIS_NAME
                      ? () => setIsAnalysisNameDialogOpen(true)
                      : redirectToNewAnalysis
                  }
                  textTransform="none"
                />
              </div>
            ) : (
              <></>
            )}
            {analysisState.analysis && (
              <AnalysisNameDialog
                isOpen={isAnalysisNameDialogOpen}
                setIsOpen={setIsAnalysisNameDialogOpen}
                initialAnalysisName={analysisState.analysis.displayName}
                setAnalysisName={analysisState.setName}
                redirectToNewAnalysis={redirectToNewAnalysis}
              />
            )}
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

  const activeMapTypePlugin =
    activeMarkerConfiguration?.type === 'barplot'
      ? barMarkerPlugin
      : activeMarkerConfiguration?.type === 'bubble'
      ? bubbleMarkerPlugin
      : activeMarkerConfiguration?.type === 'pie'
      ? donutMarkerPlugin
      : undefined;

  return (
    <PromiseResult state={appsPromiseState}>
      {(apps: ComputationAppOverview[]) => {
        const activePanelItem = findActiveSidePanelItem();
        const activeSideNavigationItemMenu =
          activePanelItem?.renderSidePanelDrawer(apps) ?? null;

        const mapTypeMapLayerProps: MapTypeMapLayerProps = {
          apps,
          analysisState,
          appState,
          studyId,
          filters: filtersIncludingTimeSlider,
          studyEntities,
          geoConfigs,
          configuration: activeMarkerConfiguration,
          updateConfiguration: updateMarkerConfigurations as any,
          filtersIncludingViewport: filtersIncludingViewportAndTimeSlider,
          totalCounts,
          filteredCounts,
          hideVizInputsAndControls,
          setHideVizInputsAndControls,
        };

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
                  filterList={<FilterChipListForHeader />}
                  siteInformation={props.siteInformationProps}
                  onAnalysisNameEdit={analysisState.setName}
                  studyName={studyRecord.displayName}
                  mapTypeDetails={
                    activeMapTypePlugin?.MapTypeHeaderDetails && (
                      <activeMapTypePlugin.MapTypeHeaderDetails
                        {...mapTypeMapLayerProps}
                      />
                    )
                  }
                >
                  {/* child elements will be distributed across, 'hanging' below the header */}
                  {/*  Time slider component - only if prerequisite variable is available */}
                  {appState.timeSliderConfig &&
                    appState.timeSliderConfig.variable && (
                      <EZTimeFilter
                        studyId={studyId}
                        entities={studyEntities}
                        subsettingClient={subsettingClient}
                        filters={filters}
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                        config={appState.timeSliderConfig}
                        updateConfig={setTimeSliderConfig}
                      />
                    )}
                </MapHeader>
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
                    isUserLoggedIn={userLoggedIn}
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
                    showSpinner={false}
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
                    {activeMapTypePlugin?.MapLayerComponent && (
                      <activeMapTypePlugin.MapLayerComponent
                        {...mapTypeMapLayerProps}
                      />
                    )}
                  </MapVEuMap>
                </div>

                {activeMapTypePlugin?.MapOverlayComponent && (
                  <activeMapTypePlugin.MapOverlayComponent
                    {...mapTypeMapLayerProps}
                  />
                )}
              </div>
            </DocumentationContainer>
          </ShowHideVariableContextProvider>
        );
      }}
    </PromiseResult>
  );
}
