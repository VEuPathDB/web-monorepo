import { useCallback, useMemo, useState } from 'react';

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
import {
  Close,
  Download,
  FilledButton,
  Filter,
  FloatingButton,
} from '@veupathdb/coreui';
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
import { SemiTransparentHeader } from './SemiTransparentHeader';
import FilterChipList from '../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import { MapSideNavigation } from './MapSideNavigation';
import { SiteInformationProps } from '..';
import FloatingVizManagement from './FloatingVizManagement';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { filtersFromBoundingBox } from '../../core/utils/visualization';
import { BarChartTwoTone } from '@material-ui/icons';

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
    setIsSubsetPanelOpen,
  } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();
  const geoConfigs = useGeoConfig(studyEntities);
  const geoConfig = geoConfigs[0];

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

  const FilterChipListForHeader = () => {
    const filterChipConfig: VariableLinkConfig = {
      type: 'button',
      onClick(value) {
        setIsSubsetPanelOpen && setIsSubsetPanelOpen(true);
        setSubsetVariableAndEntity(value);
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
          text="Add filters"
          onPress={() => setIsSubsetPanelOpen(true)}
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

  /** Again, for demonstration purposes. This is showing that we
   * can keep track of the open panels and use that info to
   * conditionally render some styles or something.
   */
  const [activeSideMenuIndex, setActiveSideMenuIndex] =
    useState<number | undefined>();
  const [sideNavigationIsExpanded, setSideNavigationIsExpanded] =
    useState<boolean>(true);

  const sideNavigationItemObjs = [
    {
      isButton: true,
      labelText: 'Add a Plot',
      icon: <BarChartTwoTone />,
    },
    {
      isButton: true,
      labelText: 'Filter Data',
      icon: <Filter />,
    },
    {
      isButton: true,
      labelText: 'Download Map',
      icon: <Download />,
    },
  ];

  const sideNavigationItems = sideNavigationItemObjs.map((item, index) => {
    return (
      <button
        style={buttonStyles}
        onClick={() => {
          setActiveSideMenuIndex((currentIndex) =>
            currentIndex === index ? undefined : index
          );
        }}
      >
        <span style={iconStyles} aria-hidden>
          {item.icon}
        </span>
        <span style={labelStyles}>{item.labelText}</span>
      </button>
    );
  });

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

  return (
    <PromiseResult state={appPromiseState}>
      {(app) => {
        const activeNavigationItemMenu =
          activeSideMenuIndex === 0 ? (
            <FloatingVizManagement
              analysisState={analysisState}
              setActiveVisualizationId={setActiveVisualizationId}
              appState={appState}
              app={app}
              geoConfigs={geoConfigs}
              totalCounts={totalCounts}
              filteredCounts={filteredCounts}
              toggleStarredVariable={toggleStarredVariable}
              filters={filtersIncludingViewport}
            />
          ) : null;

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
                  <SemiTransparentHeader
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
                    activeNavigationMenu={activeNavigationItemMenu}
                  >
                    <div>
                      <ul style={{ margin: 0, padding: 0 }}>
                        {sideNavigationItems.map((item, itemIndex) => {
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
                                padding: '0.25rem',
                                width: '100%',
                                transition: 'background 0.2s ease',
                                // An example of an active state style.
                                fontWeight: isActive ? 'bold' : 'inherit',
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
              <FloatingDiv
                style={{
                  top: 100,
                  left: 100,
                  right: 100,
                  bottom: 10,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {appState.isSubsetPanelOpen && (
                  <>
                    <FloatingButton
                      text=""
                      icon={Close}
                      onPress={() => setIsSubsetPanelOpen(false)}
                      styleOverrides={{
                        container: {
                          display: 'flex',
                          marginLeft: 'auto',
                        },
                      }}
                    />
                    <div style={{ overflow: 'auto' }}>
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
                  </>
                )}
              </FloatingDiv>
            </DocumentationContainer>
          </ShowHideVariableContextProvider>
        );
      }}
    </PromiseResult>
  );
}
