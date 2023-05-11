import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

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
  usePromise,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
  useSubsettingClient,
} from '../../core';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { useGeoConfig } from '../../core/hooks/geoConfig';
import { DocumentationContainer } from '../../core/components/docs/DocumentationContainer';
import { Download, FilledButton, Filter, H5, Table } from '@veupathdb/coreui';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import ShowHideVariableContextProvider from '../../core/utils/show-hide-variable-context';
import { MapLegend } from './MapLegend';
import { AppState, useAppState, defaultAppState } from './appState';
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
import { useStandaloneMapMarkers } from './hooks/standaloneMapMarkers';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import DraggableVisualization from './DraggableVisualization';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import Login from '../../workspace/sharing/Login';
import { useLoginCallbacks } from '../../workspace/sharing/hooks';
import NameAnalysis from '../../workspace/sharing/NameAnalysis';
import NotesTab from '../../workspace/NotesTab';
import ConfirmShareAnalysis from '../../workspace/sharing/ConfirmShareAnalysis';
import { useHistory } from 'react-router';
import { uniq, isEqual } from 'lodash';
import DownloadTab from '../../workspace/DownloadTab';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  BarPlotMarkerConfigurationMenu,
  MarkerConfiguration,
  MarkerConfigurationSelector,
  PieMarkerConfigurationMenu,
} from './MarkerConfiguration';
import { BarPlotMarkers, DonutMarkers } from './MarkerConfiguration/icons';
import { AllAnalyses } from '../../workspace/AllAnalyses';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { isSavedAnalysis } from '../../core/utils/analysis';

enum MapSideNavItemLabels {
  Download = 'Download',
  Filter = 'Filter',
  Notes = 'Notes',
  Markers = 'Markers',
  Plot = 'Plot',
  Share = 'Share',
  StudyDetails = 'View Study Details',
  MyAnalyses = 'My Analyses',
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
  pointerEvents: 'auto',
};

export const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

interface Props {
  analysisId?: string;
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
    setViewport,
    setActiveVisualizationId,
    setBoundsZoomLevel,
    setSubsetVariableAndEntity,
    sharingUrl,
    setIsSubsetPanelOpen = () => {},
    setActiveMarkerConfigurationType,
    setMarkerConfigurations,
  } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();
  const geoConfigs = useGeoConfig(studyEntities);
  const geoConfig = geoConfigs[0];
  const theme = useUITheme();
  const analysisClient = useAnalysisClient();
  const subsettingClient = useSubsettingClient();

  const getDefaultVariableId = useGetDefaultVariableIdCallback();
  const defaultVariable = getDefaultVariableId(studyMetadata.rootEntity.id);

  const { activeMarkerConfigurationType = 'pie', markerConfigurations = [] } =
    appState;

  const defautMarkerConfigurations: MarkerConfiguration[] = useMemo(() => {
    return [
      {
        type: 'pie',
        selectedVariable: defaultVariable,
      },
      {
        type: 'barplot',
        selectedPlotMode: 'count',
        selectedVariable: defaultVariable,
      },
    ];
  }, [defaultVariable]);

  useEffect(
    function generateDefaultMarkerConfigurationsIfNeeded() {
      if (markerConfigurations.length > 0) return;

      setMarkerConfigurations(defautMarkerConfigurations);
    },
    [
      defautMarkerConfigurations,
      markerConfigurations.length,
      setMarkerConfigurations,
    ]
  );

  const activeMarkerConfiguration =
    markerConfigurations.find(
      (markerConfig) => markerConfig.type === activeMarkerConfigurationType
    ) || defautMarkerConfigurations[0];

  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(activeMarkerConfiguration.selectedVariable) ?? {};

  const filters = analysisState.analysis?.descriptor.subset.descriptor;

  function updateMarkerConfigurations(
    updatedConfiguration: MarkerConfiguration
  ) {
    const nextMarkerConfigurations = markerConfigurations.map(
      (configuration) => {
        if (configuration.type === updatedConfiguration.type) {
          return updatedConfiguration;
        }
        return configuration;
      }
    );
    setMarkerConfigurations(nextMarkerConfigurations);
  }

  const adaptedMarkerTypename = (() => {
    if (activeMarkerConfiguration.type === 'barplot') {
      // The marker type for barplots is either `count` or `proportion`.
      // `useMapMarkers` needs to know this.
      return activeMarkerConfiguration.selectedPlotMode;
    }

    return activeMarkerConfiguration.type;
  })();

  const {
    markers,
    pending,
    error,
    legendItems,
    outputEntity,
    totalVisibleEntityCount,
    totalVisibleWithOverlayEntityCount,
  } = useStandaloneMapMarkers({
    boundsZoomLevel: appState.boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters,
    // xAxisVariable: activeMarkerConfiguration.selectedVariable,
    // computationType: 'pass',
    markerType: adaptedMarkerTypename,
    // checkedLegendItems: undefined,
    overlayVariable: activeMarkerConfiguration.selectedVariable,
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
        getOverlayVariable: (_) => activeMarkerConfiguration.selectedVariable,
        getOverlayVariableHelp: () =>
          'The overlay variable can be selected via the top-right panel.',
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
  }, [activeMarkerConfiguration.selectedVariable]);

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

  const outputEntityFilteredCount =
    filteredCounts.value && outputEntity
      ? filteredCounts.value[outputEntity.id]
      : 0;

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
    alignItems: 'center',
    background: 'transparent',
    borderColor: 'transparent',
    display: 'flex',
    fontSize: 16,
    justifyContent: 'flex-start',
    margin: 0,
    padding: 0,
    width: '100%',
  };
  const iconStyles: React.CSSProperties = {
    alignItems: 'center',
    display: 'flex',
    height: 25,
    justifyContent: 'center',
    width: 25,
  };
  const labelStyles: React.CSSProperties = {
    marginLeft: '0.5rem',
  };

  const filteredEntities = uniq(filters?.map((f) => f.entityId));

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
                  icon: <DonutMarkers style={{ height: 30 }} />,
                  renderConfigurationMenu:
                    activeMarkerConfiguration.type === 'pie' ? (
                      <PieMarkerConfigurationMenu
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
                  icon: <BarPlotMarkers style={{ height: 30 }} />,
                  renderConfigurationMenu:
                    activeMarkerConfiguration.type === 'barplot' ? (
                      <BarPlotMarkerConfigurationMenu
                        inputs={[{ name: 'overlay', label: 'Overlay' }]}
                        entities={studyEntities}
                        onChange={updateMarkerConfigurations}
                        starredVariables={
                          analysisState.analysis?.descriptor.starredVariables ??
                          []
                        }
                        toggleStarredVariable={toggleStarredVariable}
                        selectedPlotMode={
                          activeMarkerConfiguration.selectedPlotMode
                        }
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
                          : getDefaultVariableId(variableValue?.entityId)
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
              return <Login {...loginCallbacks} showCloseButton={false} />;
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
        labelText: MapSideNavItemLabels.MyAnalyses,
        icon: <Table />,
        renderSideNavigationPanel: () => {
          return (
            <div
              css={{
                h1: {
                  fontSize: '21px',
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

  // for flyTo functionality
  const [willFlyTo, setWillFlyTo] = useState(false);

  // Only decide if we need to flyTo while we are waiting for marker data
  // then only trigger the flyTo when no longer pending.
  // This makes sure that the user sees the global location of the data before the flyTo happens.
  useEffect(() => {
    if (pending) {
      setWillFlyTo(isEqual(appState.viewport, defaultAppState.viewport));
    }
  }, [pending, appState.viewport]);

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
                  <MapVEuMap
                    height="100%"
                    width="100%"
                    style={mapStyle}
                    showMouseToolbar={true}
                    showLayerSelector={false}
                    showSpinner={pending}
                    animation={defaultAnimation}
                    viewport={appState.viewport}
                    markers={finalMarkers}
                    mouseMode={appState.mouseMode}
                    flyToMarkers={
                      markers && markers.length > 0 && willFlyTo && !pending
                    }
                    flyToMarkersDelay={500}
                    onBoundsChanged={setBoundsZoomLevel}
                    onViewportChanged={setViewport}
                    onMouseModeChange={setMouseMode}
                    showGrid={geoConfig?.zoomLevelToAggregationLevel !== null}
                    zoomLevelToGeohashLevel={
                      geoConfig?.zoomLevelToAggregationLevel
                    }
                    // pass defaultViewport & isStandAloneMap props for custom zoom control
                    defaultViewport={defaultAppState.viewport}
                  />
                </div>

                <FloatingDiv
                  style={{
                    top: 250,
                    right: 8,
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
    let finalEntityId = '';
    let finalVariableId = '';

    if (entityId || featuredFields.length === 0) {
      // Use the first variable in the entity
      const entity = entityId
        ? entities.find((e) => e.id === entityId)
        : entities[0];

      if (entity) {
        finalEntityId = entity.id;

        const firstVariable = findFirstVariable(
          fieldTree,
          entity.id
        )?.field.term.split('/')[1];

        finalVariableId = firstVariable || '';
      }
    } else {
      // Use the first featured variable
      [finalEntityId, finalVariableId] = featuredFields[0].term.split('/');
    }

    return { entityId: finalEntityId, variableId: finalVariableId };
  };
}
