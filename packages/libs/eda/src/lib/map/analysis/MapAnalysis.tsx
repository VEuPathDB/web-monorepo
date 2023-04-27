import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  AnalysisState,
  DEFAULT_ANALYSIS_NAME,
  EntityDiagram,
  PromiseResult,
  useAnalysis,
  useDataClient,
  useDownloadClient,
  useFindEntityAndVariable,
  usePromise,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
} from '../../core';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { useGeoConfig } from '../../core/hooks/geoConfig';
import { useMapMarkers } from '../../core/hooks/mapMarkers';
import { DocumentationContainer } from '../../core/components/docs/DocumentationContainer';
import { Download, FilledButton, Filter } from '@veupathdb/coreui';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import ShowHideVariableContextProvider from '../../core/utils/show-hide-variable-context';
import { MapLegend } from './MapLegend';
import { AppState, useAppState } from './appState';
import { FloatingDiv } from './FloatingDiv';
import Subsetting from '../../workspace/Subsetting';
import { findFirstVariable } from '../../workspace/Utils';
import {
  useFeaturedFields,
  useFeaturedFieldsFromTree,
  useFieldTree,
  useFlattenedFields,
} from '../../core/components/variableTrees/hooks';
import { MapHeader } from './MapHeader';
import FilterChipList from '../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import { MapSideNavigation } from './MapSideNavigation';
import { SiteInformationProps } from '..';
import MapVizManagement from './MapVizManagement';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { filtersFromBoundingBox } from '../../core/utils/visualization';
import {
  BarChartSharp,
  EditLocation,
  InfoOutlined,
  Notes,
  Share,
} from '@material-ui/icons';
import { ComputationPlugin } from '../../core/components/computations/Types';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { LayoutOptions } from '../../core/components/layouts/types';
import { OverlayOptions } from '../../core/components/visualizations/options/types';
import { FloatingLayout } from '../../core/components/layouts/FloatingLayout';
import { ZeroConfigWithButton } from '../../core/components/computations/ZeroConfiguration';
import { histogramVisualization } from '../../core/components/visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../../core/components/visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../core/components/visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../core/components/visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../../core/components/visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../core/components/visualizations/implementations/BoxplotVisualization';
import * as t from 'io-ts';
import {
  ComputationAppOverview,
  Visualization,
} from '../../core/types/visualization';
import DraggableVisualization from './DraggableVisualization';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import Login from '../../workspace/sharing/Login';
import { useLoginCallbacks } from '../../workspace/sharing/hooks';
import NameAnalysis from '../../workspace/sharing/NameAnalysis';
import NotesTab from '../../workspace/NotesTab';
import ConfirmShareAnalysis from '../../workspace/sharing/ConfirmShareAnalysis';
import { useHistory } from 'react-router';
import { MarkerConfigurationSelector } from './MarkerConfiguration';
import {
  DonutConfigurationMenu,
  DonutMarkerConfiguration,
} from './MarkerConfiguration/DonutConfigurationMenu';
import { uniq } from 'lodash';
import DownloadTab from '../../workspace/DownloadTab';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  BarPlotConfigurationMenu,
  BarPlotMarkerConfiguration,
} from './MarkerConfiguration/BarPlotConfigurationMenu';
import { MarkerConfiguration } from './MarkerConfiguration';

enum MapSideNavItemLabels {
  Download = 'Download',
  Filter = 'Filter',
  Notes = 'Notes',
  Markers = 'Markers',
  Plot = 'Plot',
  Share = 'Share',
  StudyDetails = 'View Study Details',
}

type SideNavigationItemConfigurationObject = {
  href?: string;
  labelText: MapSideNavItemLabels;
  icon: ReactNode;
  renderSideNavigationPanel: (app: ComputationAppOverview) => ReactNode;
  onToggleSideMenuItem?: (isActive: boolean) => void;
};

function getSideNavItemIndexByLabel(
  label: MapSideNavItemLabels,
  navItems: SideNavigationItemConfigurationObject[]
): number {
  return navItems.findIndex((navItem) => navItem.labelText === label);
}

const mapStyle: React.CSSProperties = {
  zIndex: 1,
};

interface Props {
  analysisId: string;
  sharingUrl: string;
  studyId: string;
  siteInformationProps: SiteInformationProps;
}

export function MapAnalysis(props: Props) {
  const analysisState = useAnalysis(props.analysisId, 'pass-through');
  const appStateAndSetters = useAppState('@@mapApp@@', analysisState);
  if (appStateAndSetters.appState == null) return null;
  return (
    <MapAnalysisImpl
      {...props}
      {...(appStateAndSetters as CompleteAppState)}
      analysisState={analysisState}
    />
  );
}

type CompleteAppState = ReturnType<typeof useAppState> & {
  appState: AppState;
  analysisState: AnalysisState;
};

function MapAnalysisImpl(props: Props & CompleteAppState) {
  const {
    appState,
    analysisState,
    setMouseMode,
    setSelectedOverlayVariable,
    setViewport,
    setActiveVisualizationId,
    setBoundsZoomLevel,
    setSubsetVariableAndEntity,
    sharingUrl,
    setIsSubsetPanelOpen = () => {},
  } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();
  const geoConfigs = useGeoConfig(studyEntities);
  const geoConfig = geoConfigs[0];
  const theme = useUITheme();

  const selectedVariables = useMemo(
    () => ({
      overlay: appState.selectedOverlayVariable,
    }),
    [appState.selectedOverlayVariable]
  );

  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(selectedVariables.overlay) ?? {};

  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  /**
   * Keep track of which marker type is active. `markerType` -> activeMarkerType `xAxisVariable`: selectedVariables.overlay
   */
  const {
    markers,
    pending,
    legendItems,
    basicMarkerError,
    outputEntity,
    overlayError,
    totalEntityCount,
    totalVisibleEntityCount,
    totalVisibleWithOverlayEntityCount,
  } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel: appState.boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters,
    xAxisVariable: selectedVariables.overlay,
    computationType: 'pass',
    markerType: 'pie',
    checkedLegendItems: undefined,
    //TO DO: maybe dependentAxisLogScale
  });

  const finalMarkers = useMemo(() => markers || [], [markers]);

  const dataClient = useDataClient();

  const downloadClient = useDownloadClient();

  const userLoggedIn = useWdkService((wdkService) => {
    return wdkService.getCurrentUser().then((user) => !user.isGuest);
  });

  const history = useHistory();
  function showLoginForm() {
    const currentUrl = window.location.href;
    const loginUrl = `${props.siteInformationProps.loginUrl}?destination=${currentUrl}`;
    history.push(loginUrl);
  }

  function toggleVisible() {
    setActiveSideMenuIndex(undefined);
  }

  const loginCallbacks = useLoginCallbacks({ showLoginForm, toggleVisible });

  const appPromiseState = usePromise(
    useCallback(async () => {
      const { apps } = await dataClient.getApps();
      const app = apps.find((a) => a.name === 'pass');
      if (app == null) throw new Error('Could not find pass app.');
      return app;
    }, [dataClient])
  );

  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  // Customise the visualization plugin
  const plugin = useMemo((): ComputationPlugin => {
    function vizWithOptions(
      visualization: VisualizationPlugin<LayoutOptions & OverlayOptions>
    ) {
      return visualization.withOptions({
        hideFacetInputs: true,
        layoutComponent: FloatingLayout,
        getOverlayVariable: (_) => appState.selectedOverlayVariable,
        getOverlayVariableHelp: () =>
          'The overlay variable can be selected via the top-right panel.',
        //        getCheckedLegendItems: (_) => appState.checkedLegendItems,
      });
    }

    return {
      configurationComponent: ZeroConfigWithButton,
      isConfigurationValid: t.undefined.is,
      createDefaultConfiguration: () => undefined,
      visualizationPlugins: {
        histogram: vizWithOptions(histogramVisualization),
        twobytwo: vizWithOptions(twoByTwoVisualization),
        conttable: vizWithOptions(contTableVisualization),
        scatterplot: vizWithOptions(scatterplotVisualization),
        lineplot: vizWithOptions(lineplotVisualization),
        // 'map-markers': vizWithOptions(mapVisualization), // disabling because of potential confusion between marker colors
        barplot: vizWithOptions(barplotVisualization),
        boxplot: vizWithOptions(boxplotVisualization),
      },
    };
  }, [appState.selectedOverlayVariable]);

  const computation = analysisState.analysis?.descriptor.computations[0];

  const updateVisualizations = useCallback(
    (
      visualizations:
        | Visualization[]
        | ((visualizations: Visualization[]) => Visualization[])
    ) => {
      analysisState.setComputations((computations) =>
        computations.map((c) =>
          c.computationId !== computation?.computationId
            ? c
            : {
                ...c,
                visualizations:
                  typeof visualizations === 'function'
                    ? visualizations(c.visualizations)
                    : visualizations,
              }
        )
      );
    },
    [analysisState, computation?.computationId]
  );

  const fieldTree = useFieldTree(
    useFlattenedFields(studyEntities, 'variableTree')
  );
  const featuredFields = useFeaturedFields(studyEntities, 'variableTree');

  const subsetVariableAndEntity = useMemo(() => {
    if (appState.subsetVariableAndEntity)
      return appState.subsetVariableAndEntity;
    if (featuredFields.length) {
      const [entityId, variableId] = featuredFields[0].term.split('/');
      return { entityId, variableId };
    } else {
      const variable = findFirstVariable(
        fieldTree,
        studyMetadata.rootEntity.id
      );
      const [entityId, variableId] = variable?.field.term.split('/') ?? [];
      return { entityId, variableId };
    }
  }, [
    appState.subsetVariableAndEntity,
    featuredFields,
    fieldTree,
    studyMetadata.rootEntity.id,
  ]);

  const outputEntityTotalCount =
    totalCounts.value && outputEntity ? totalCounts.value[outputEntity.id] : 0;

  const [mapHeaderIsExpanded, setMapHeaderIsExpanded] = useState<boolean>(true);

  function openSubsetPanelFromControlOutsideOfNavigation() {
    setIsSubsetPanelOpen(true);
    setActiveSideMenuIndex(filterSideMenuItemIndex);
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
            activeSideMenuIndex === filterSideMenuItemIndex
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

  /**
   * The following code and styles are for demonstration purposes
   * at this point. After #1671 is merged, we can implement these
   * menu buttons and their associated panels for real.
   */
  const buttonStyles: React.CSSProperties = {
    background: 'transparent',
    borderColor: 'transparent',
    fontSize: 16,
    margin: 0,
    padding: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  };
  const iconStyles: React.CSSProperties = {
    height: 25,
    width: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  const labelStyles: React.CSSProperties = {
    marginLeft: '0.5rem',
  };

  const [markerConfigurations, setMarkerConfigurations] = useState<
    MarkerConfiguration[]
  >([
    {
      type: 'pie',
      selectedVariable: selectedVariables.overlay || {
        entityId: '',
        variableId: '',
      },
    },
    {
      type: 'barplot',
      selectedPlotMode: 'count',
      selectedVariable: selectedVariables.overlay || {
        entityId: '',
        variableId: '',
      },
    },
  ]);

  function updateMarkerConfigurations(
    updatedConfiguration: MarkerConfiguration
  ) {
    setMarkerConfigurations((configurations) =>
      configurations.map((configuration) => {
        if (configuration.type === updatedConfiguration.type) {
          return updatedConfiguration;
        }
        return configuration;
      })
    );
  }

  const [activeMarkerConfigurationType, setActiveMarkerConfigurationType] =
    useState<MarkerConfiguration['type']>('barplot');

  const activeMarkerConfiguration = markerConfigurations.find(
    (markerConfig) => markerConfig.type === activeMarkerConfigurationType
  );
  const [barPlotMode, setBarPlotMode] = useState('count');

  const filteredEntities = uniq(filters?.map((f) => f.entityId));
  const getDefaultVariableId = useGetDefaultVariableIdCallback();

  /**
   *
   * Do type narrowing for each marker configuration types.
   */
  const sideNavigationButtonConfigurationObjects: SideNavigationItemConfigurationObject[] =
    [
      {
        labelText: MapSideNavItemLabels.Markers,
        icon: <EditLocation />,
        renderSideNavigationPanel: (app) => {
          return (
            <MarkerConfigurationSelector
              activeMarkerConfigurationType={activeMarkerConfigurationType}
              setActiveMarkerConfigurationType={
                setActiveMarkerConfigurationType
              }
              markerConfigurations={[
                {
                  type: 'pie',
                  displayName: 'Donuts',
                  renderConfigurationMenu:
                    activeMarkerConfiguration?.type === 'pie' ? (
                      <DonutConfigurationMenu
                        inputs={[{ name: 'overlay', label: 'Overlay' }]}
                        entities={studyEntities}
                        onChange={updateMarkerConfigurations}
                        configuration={activeMarkerConfiguration}
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                      />
                    ) : (
                      <></>
                    ),
                },
                {
                  type: 'barplot',
                  displayName: 'Bar plots',
                  renderConfigurationMenu:
                    activeMarkerConfiguration?.type === 'barplot' ? (
                      <BarPlotConfigurationMenu
                        inputs={[{ name: 'overlay', label: 'Overlay' }]}
                        entities={studyEntities}
                        onChange={updateMarkerConfigurations}
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                        onPlotSelected={setBarPlotMode}
                        selectedPlotMode={barPlotMode}
                        configuration={activeMarkerConfiguration}
                      />
                    ) : (
                      <></>
                    ),
                },
              ]}
            />
          );
        },
      },
      {
        labelText: MapSideNavItemLabels.Filter,
        icon: <Filter />,
        renderSideNavigationPanel: () => {
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
                          : getDefaultVariableId(variableValue?.entityId),
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
              />
            </div>
          );
        },
        onToggleSideMenuItem: (isActive) => {
          setIsSubsetPanelOpen(!isActive);
        },
      },
      {
        labelText: MapSideNavItemLabels.Plot,
        icon: <BarChartSharp />,
        renderSideNavigationPanel: (app) => {
          return (
            <MapVizManagement
              analysisState={analysisState}
              updateVisualizations={updateVisualizations}
              setActiveVisualizationId={setActiveVisualizationId}
              app={app}
              activeVisualizationId={appState.activeVisualizationId}
              visualizationPlugins={plugin.visualizationPlugins}
              geoConfigs={geoConfigs}
            />
          );
        },
      },
      {
        labelText: MapSideNavItemLabels.Download,
        icon: <Download />,
        renderSideNavigationPanel: () => {
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
        labelText: MapSideNavItemLabels.Share,
        icon: <Share />,
        renderSideNavigationPanel: () => {
          if (!analysisState.analysis) return null;

          function getShareMenuContent() {
            if (!userLoggedIn) {
              return <Login {...loginCallbacks} />;
            }
            if (
              analysisState?.analysis?.displayName === DEFAULT_ANALYSIS_NAME
            ) {
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
        labelText: MapSideNavItemLabels.Notes,
        icon: <Notes />,
        renderSideNavigationPanel: (app) => {
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
        labelText: MapSideNavItemLabels.StudyDetails,
        icon: <InfoOutlined />,
        renderSideNavigationPanel: () => {
          return (
            <div
              style={{
                padding: '1em',
                width: '70vw',
                maxWidth: '1500px',
                fontSize: '.95em',
              }}
            >
              <RecordController
                recordClass="dataset"
                primaryKey={studyRecord.id.map((p) => p.value).join('/')}
              />
            </div>
          );
        },
      },
    ];

  const filterSideMenuItemIndex = getSideNavItemIndexByLabel(
    MapSideNavItemLabels.Filter,
    sideNavigationButtonConfigurationObjects
  );
  const plotSideMenuItemIndex = getSideNavItemIndexByLabel(
    MapSideNavItemLabels.Plot,
    sideNavigationButtonConfigurationObjects
  );

  const intialActiveSideMenuIndex: number | undefined = (() => {
    if (appState.activeVisualizationId) return plotSideMenuItemIndex;

    return undefined;
  })();

  const [activeSideMenuIndex, setActiveSideMenuIndex] = useState<
    number | undefined
  >(intialActiveSideMenuIndex);

  const sideNavigationButtons = sideNavigationButtonConfigurationObjects.map(
    ({ labelText, icon, onToggleSideMenuItem = () => {} }, index) => {
      return (
        <button
          style={buttonStyles}
          onClick={() => {
            onToggleSideMenuItem(activeSideMenuIndex === index);
            setActiveSideMenuIndex((currentIndex) => {
              return currentIndex === index ? undefined : index;
            });
          }}
        >
          <span style={iconStyles} aria-hidden>
            {icon}
          </span>
          <span style={labelStyles}>{labelText}</span>
        </button>
      );
    }
  );

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

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

  const [sideNavigationIsExpanded, setSideNavigationIsExpanded] =
    useState<boolean>(true);

  return (
    <PromiseResult state={appPromiseState}>
      {(app: ComputationAppOverview) => {
        const activeSideNavigationItemMenu =
          activeSideMenuIndex != null &&
          sideNavigationButtonConfigurationObjects[
            activeSideMenuIndex
          ].renderSideNavigationPanel(app);

        return (
          <ShowHideVariableContextProvider>
            <DocumentationContainer>
              <div
                style={{
                  height: '100%',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    // Make a div that completely fills its parent. Have it
                    // layout its children with flexbox.
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    // Attach this div container to it's parent.
                    position: 'absolute',
                    // Remember that just about everything in the DOM is box.
                    // This div is sitting on top of the map. By disabling
                    // pointer events we are saying: hey, div, become porous.
                    // If a user clicks you, don't capture it, but let it go
                    // to the map you're covering.
                    pointerEvents: 'none',
                  }}
                >
                  <MapHeader
                    analysisName={analysisState.analysis?.displayName}
                    entityDisplayName={
                      outputEntity?.displayNamePlural || 'Samples'
                    }
                    filterList={<FilterChipListForHeader />}
                    isExpanded={mapHeaderIsExpanded}
                    siteInformation={props.siteInformationProps}
                    onAnalysisNameEdit={analysisState.setName}
                    onToggleExpand={() => setMapHeaderIsExpanded((c) => !c)}
                    studyName={studyRecord.displayName}
                    totalEntityCount={outputEntityTotalCount}
                    totalEntityInSubsetCount={totalEntityCount}
                    visibleEntityCount={
                      totalVisibleWithOverlayEntityCount ??
                      totalVisibleEntityCount
                    }
                  />
                  <MapSideNavigation
                    isExpanded={sideNavigationIsExpanded}
                    onToggleIsExpanded={() =>
                      setSideNavigationIsExpanded((isExpanded) => !isExpanded)
                    }
                    siteInformationProps={props.siteInformationProps}
                    activeNavigationMenu={activeSideNavigationItemMenu}
                  >
                    <div>
                      <ul style={{ margin: 0, padding: 0 }}>
                        {sideNavigationButtons.map((item, itemIndex) => {
                          const isActive = activeSideMenuIndex === itemIndex;
                          return (
                            <li
                              key={itemIndex}
                              style={{
                                // These styles format the lefthand side menu items.
                                // Nothing special here. We can conditionally apply
                                // styles based on in/active states, if we like.
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                width: '100%',
                                transition: 'background 0.1s ease',
                                padding: '5px 10px',
                                fontWeight: isActive ? 'bold' : 'normal',
                                background: isActive
                                  ? theme?.palette.primary.hue[100]
                                  : 'inherit',
                              }}
                            >
                              {item}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </MapSideNavigation>
                </div>

                <MapVEuMap
                  height="100%"
                  width="100%"
                  style={mapStyle}
                  showMouseToolbar={false}
                  showZoomControl={false}
                  showLayerSelector={false}
                  showSpinner={pending}
                  animation={null}
                  viewport={appState.viewport}
                  markers={finalMarkers}
                  mouseMode={appState.mouseMode}
                  flyToMarkers={false}
                  flyToMarkersDelay={500}
                  onBoundsChanged={setBoundsZoomLevel}
                  onViewportChanged={setViewport}
                  onMouseModeChange={setMouseMode}
                  showGrid={geoConfig?.zoomLevelToAggregationLevel !== null}
                  zoomLevelToGeohashLevel={
                    geoConfig?.zoomLevelToAggregationLevel
                  }
                />
                <FloatingDiv
                  style={{
                    top: 350,
                    right: 50,
                  }}
                >
                  {legendItems.length > 0 && (
                    <MapLegend
                      legendItems={legendItems}
                      title={overlayVariable?.displayName}
                      // control to show checkbox. default: true
                      showCheckbox={false}
                    />
                  )}
                </FloatingDiv>
                {/* <FloatingDiv
                  style={{
                    top: 250,
                    left: 500,
                    left: 100,
                  }}
                >
                  <div>
                    {safeHtml(studyRecord.displayName)} ({totalEntityCount})
                  </div>
                  <div>
                    Showing {entity?.displayName} variable {variable?.displayName}
                  </div>
                  <div>
                    <FilledButton
                      text="Open Filters"
                      onPress={() => setIsSubsetPanelOpen(true)}
                    />
                  </div>
      */}
                {activeSideMenuIndex === plotSideMenuItemIndex && (
                  <DraggableVisualization
                    analysisState={analysisState}
                    updateVisualizations={updateVisualizations}
                    setActiveVisualizationId={setActiveVisualizationId}
                    appState={appState}
                    app={app}
                    visualizationPlugins={plugin.visualizationPlugins}
                    geoConfigs={geoConfigs}
                    totalCounts={totalCounts}
                    filteredCounts={filteredCounts}
                    toggleStarredVariable={toggleStarredVariable}
                    filters={filtersIncludingViewport}
                  />
                )}

                {(basicMarkerError || overlayError) && (
                  <FloatingDiv
                    style={{
                      top: undefined,
                      bottom: 50,
                      left: 100,
                      right: 100,
                    }}
                  >
                    {basicMarkerError && <div>{String(basicMarkerError)}</div>}
                    {overlayError && <div>{String(overlayError)}</div>}
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

/**
 * TODO: This is pasted directly `DefaultVariableRedirect`. Cover this hook by some
 * kind of test and simplify its logic.
 */
export function useGetDefaultVariableIdCallback() {
  const entities = useStudyEntities();
  const flattenedFields = useFlattenedFields(entities, 'variableTree');
  const fieldTree = useFieldTree(flattenedFields);
  const featuredFields = useFeaturedFieldsFromTree(fieldTree);

  return function getDefaultVariableIdCallback(entityId?: string) {
    let finalVariableId: string | undefined;

    if (entityId || featuredFields.length === 0) {
      // Use the first variable in the entity
      const entity = entityId
        ? entities.find((e) => e.id === entityId)
        : entities[0];
      finalVariableId =
        entity &&
        findFirstVariable(fieldTree, entity.id)?.field.term.split('/')[1];
    } else {
      // Use the first featured variable
      [finalVariableId] = featuredFields[0].term.split('/');
    }

    return finalVariableId;
  };
}
