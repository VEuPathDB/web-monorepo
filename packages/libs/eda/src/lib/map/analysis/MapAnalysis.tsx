import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import {
  AnalysisState,
  PromiseResult,
  useAnalysis,
  useDataClient,
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
  useFieldTree,
  useFlattenedFields,
} from '../../core/components/variableTrees/hooks';
import { MapHeader } from './MapHeader';
import FilterChipList from '../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import { MapSideNavigation } from './MapSideNavigation';
import { SiteInformationProps } from '..';
import MapVizManagement from './MapVizManagement';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
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
import NotesTab from '../../workspace/NotesTab';

const MapSideNavItemLabels = {
  Download: 'Download',
  Filter: 'Filter',
  Notes: 'Notes',
  Paint: 'Paint',
  Plot: 'Plot',
  Share: 'Share',
  StudyDetails: 'View Study Details',
};

const mapStyle: React.CSSProperties = {
  zIndex: 1,
};

interface Props {
  analysisId: string;
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
    filters: analysisState.analysis?.descriptor.subset.descriptor,
    xAxisVariable: selectedVariables.overlay,
    computationType: 'pass',
    markerType: 'pie',
    checkedLegendItems: undefined,
    //TO DO: maybe dependentAxisLogScale
  });

  const finalMarkers = useMemo(() => markers || [], [markers]);

  const dataClient = useDataClient();

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
    const filterChipConfig: VariableLinkConfig = {
      type: 'button',
      onClick(value) {
        setSubsetVariableAndEntity(value);
        openSubsetPanelFromControlOutsideOfNavigation();
      },
    };

    const filters = analysisState.analysis?.descriptor.subset.descriptor;

    if (!studyEntities || !filters) return <></>;

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

  type SideNavigationItemConfigurationObject = {
    href?: string;
    labelText: string;
    icon: ReactNode;
    renderSideNavigationPanel: (app: ComputationAppOverview) => ReactNode;
    onToggleSideMenuItem?: (isActive: boolean) => void;
  };
  const sideNavigationRenderPlaceholder: SideNavigationItemConfigurationObject['renderSideNavigationPanel'] =
    (_) => (
      <div style={{ padding: '2rem' }}>
        <p>Not Implemented!</p>
      </div>
    );

  const sideNavigationButtonConfigurationObjects: SideNavigationItemConfigurationObject[] =
    [
      {
        labelText: MapSideNavItemLabels.Paint,
        icon: <EditLocation />,
        renderSideNavigationPanel: sideNavigationRenderPlaceholder,
      },
      {
        labelText: MapSideNavItemLabels.Filter,
        icon: <Filter />,
        renderSideNavigationPanel: () => {
          return (
            <div
              style={{
                width: 1000,
                maxHeight: 650,
                padding: '0 25px',
                overflow: 'scroll',
                resize: 'both',
              }}
            >
              <Subsetting
                variableLinkConfig={{
                  type: 'button',
                  onClick: setSubsetVariableAndEntity,
                }}
                entityId={subsetVariableAndEntity?.entityId ?? ''}
                variableId={subsetVariableAndEntity?.variableId ?? ''}
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
        renderSideNavigationPanel: sideNavigationRenderPlaceholder,
      },
      {
        labelText: MapSideNavItemLabels.Share,
        icon: <Share />,
        renderSideNavigationPanel: sideNavigationRenderPlaceholder,
      },
      {
        labelText: MapSideNavItemLabels.Notes,
        icon: <Notes />,
        renderSideNavigationPanel: (app) => {
          return (
            <div
              style={{
                // This matches the `marginTop` applied by `<NotesTab />`
                padding: '0 35px',
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
        renderSideNavigationPanel: sideNavigationRenderPlaceholder,
      },
    ];

  const filterSideMenuItemIndex =
    sideNavigationButtonConfigurationObjects.findIndex(
      (config) => config.labelText === MapSideNavItemLabels.Filter
    );
  const plotSideMenuItemIndex =
    sideNavigationButtonConfigurationObjects.findIndex(
      (config) => config.labelText === MapSideNavItemLabels.Plot
    );

  const indexOfInitialActiveItem: number | undefined = (() => {
    if (appState.isSubsetPanelOpen) return filterSideMenuItemIndex;
    if (appState.activeVisualizationId) return plotSideMenuItemIndex;

    return undefined;
  })();

  const [activeSideMenuIndex, setActiveSideMenuIndex] = useState<
    number | undefined
  >(indexOfInitialActiveItem);

  useEffect(
    /**
     * Controls outside side navigation open subset panel. This effect synchronizes the
     * subset panel open state with the active side navigation item state to avoid an
     * open subset panel and an inactive navigation item.
     */
    function syncIsSubsetPanelOpenStateWithActiveNavItemState() {
      if (
        appState.isSubsetPanelOpen &&
        filterSideMenuItemIndex !== activeSideMenuIndex
      ) {
        // If we're here, then we have the condition where the subsetting panel
        // is open, but the user has selected another side menu item.
        setIsSubsetPanelOpen(false);
      }
    },
    [
      activeSideMenuIndex,
      appState.isSubsetPanelOpen,
      filterSideMenuItemIndex,
      setIsSubsetPanelOpen,
    ]
  );

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
                <FloatingDiv
                  style={{
                    top: 150,
                    right: 50,
                  }}
                >
                  <span style={{ backgroundColor: 'yellow' }}>
                    temporary - remove me
                  </span>
                  <InputVariables
                    inputs={[{ name: 'overlay', label: 'Overlay' }]}
                    entities={studyEntities}
                    selectedVariables={selectedVariables}
                    onChange={(selectedVariables) =>
                      setSelectedOverlayVariable(selectedVariables.overlay)
                    }
                    starredVariables={
                      analysisState.analysis?.descriptor.starredVariables ?? []
                    }
                    toggleStarredVariable={toggleStarredVariable}
                  />
                </FloatingDiv>

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
