import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import {
  AllValuesDefinition,
  AnalysisState,
  BubbleOverlayConfig,
  CategoricalVariableDataShape,
  DEFAULT_ANALYSIS_NAME,
  DateRangeFilter,
  DateVariable,
  EntityDiagram,
  NumberRangeFilter,
  NumberVariable,
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
  Plus,
  FilledButton,
  Filter as FilterIcon,
  FloatingButton,
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
import { MapSideNavigation } from './MapSideNavigation';
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
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
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
import { DraggablePanelCoordinatePair } from '@veupathdb/coreui/lib/components/containers/DraggablePanel';
import _ from 'lodash';

import EZTimeFilter from './EZTimeFilter';
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
}

enum MarkerTypeLabels {
  pie = 'Donuts',
  barplot = 'Bar plots',
  bubble = 'Bubbles',
}

type SideNavigationItemConfigurationObject = {
  href?: string;
  labelText: MapSideNavItemLabels;
  icon: ReactNode;
  renderSideNavigationPanel: (apps: ComputationAppOverview[]) => ReactNode;
  onToggleSideMenuItem?: (isActive: boolean) => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
  subMenuConfig?: SubMenuItems[];
};

type SubMenuItems = {
  /**
   * id is derived by concatentating the parent and sub-menu labels, since:
   *  A) parent labels must be unique (makes no sense to offer the same label in a menu!)
   *  B) sub-menu labels must be unique
   */
  id: string;
  labelText: string;
  icon?: ReactNode;
  onClick: () => void;
  isActive: boolean;
};

const mapStyle: React.CSSProperties = {
  zIndex: 1,
  pointerEvents: 'auto',
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
  fontSize: '1.3em',
  justifyContent: 'flex-start',
  margin: 0,
  padding: 0,
  width: '100%',
};
const iconStyles: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  height: '1.5em',
  width: '1.5em',
  justifyContent: 'center',
};
const labelStyles: React.CSSProperties = {
  marginLeft: '0.5em',
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
    analysisId,
    setViewport,
    setActiveVisualizationId,
    setBoundsZoomLevel,
    setSubsetVariableAndEntity,
    // sharingUrl,
    setIsSubsetPanelOpen = () => {},
    setActiveMarkerConfigurationType,
    setMarkerConfigurations,
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

  // FIXME use the sharingUrl prop to construct this
  const sharingUrl = new URL(`../${analysisId}/import`, window.location.href)
    .href;

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
        filters: filtersIncludingViewportAndTimeSlider, // TO DO: decide whether to filter on time slider here
      });
    }, [
      overlayVariable,
      activeMarkerConfiguration,
      overlayEntity,
      subsettingClient,
      studyId,
      filtersIncludingViewportAndTimeSlider,
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
    filters: filtersIncludingTimeSlider,
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

  const [isAnalysisNameDialogOpen, setIsAnalysisNameDialogOpen] =
    useState(false);
  const { url: urlRouteMatch } = useRouteMatch();
  const redirectURL = studyId
    ? urlRouteMatch.endsWith(studyId)
      ? `/workspace/${urlRouteMatch}/new`
      : Path.resolve(urlRouteMatch, '../new')
    : null;
  const redirectToNewAnalysis = useCallback(() => {
    if (redirectURL) {
      history.push(redirectURL);
      // push() alone doesn't seem to work in this context; the URL changes,
      // but the page doesn't load, so we force a refresh
      history.go(0);
    }
  }, [history, redirectURL]);

  const sideNavigationButtonConfigurationObjects: SideNavigationItemConfigurationObject[] =
    [
      {
        labelText: MapSideNavItemLabels.ConfigureMap,
        icon: <EditLocation />,
        isExpandable: true,
        subMenuConfig: [
          {
            // concatenating the parent and subMenu labels creates a unique ID
            id: MapSideNavItemLabels.ConfigureMap + MarkerTypeLabels.pie,
            labelText: MarkerTypeLabels.pie,
            icon: <DonutMarker style={{ height: '1.25em' }} />,
            onClick: () => setActiveMarkerConfigurationType('pie'),
            isActive: activeMarkerConfigurationType === 'pie',
          },
          {
            // concatenating the parent and subMenu labels creates a unique ID
            id: MapSideNavItemLabels.ConfigureMap + MarkerTypeLabels.barplot,
            labelText: MarkerTypeLabels.barplot,
            icon: <BarPlotMarker style={{ height: '1.25em' }} />,
            onClick: () => setActiveMarkerConfigurationType('barplot'),
            isActive: activeMarkerConfigurationType === 'barplot',
          },
          {
            // concatenating the parent and subMenu labels creates a unique ID
            id: MapSideNavItemLabels.ConfigureMap + MarkerTypeLabels.bubble,
            labelText: MarkerTypeLabels.bubble,
            icon: <BubbleMarker style={{ height: '1.25em' }} />,
            onClick: () => setActiveMarkerConfigurationType('bubble'),
            isActive: activeMarkerConfigurationType === 'bubble',
          },
        ],
        renderSideNavigationPanel: (apps) => {
          const markerVariableConstraints = apps
            .find((app) => app.name === 'standalone-map')
            ?.visualizations.find(
              (viz) => viz.name === 'map-markers'
            )?.dataElementConstraints;

          const markerConfigurationObjects: MarkerConfigurationOption[] = [
            {
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
                      analysisState.analysis?.descriptor.starredVariables ?? []
                    }
                    toggleStarredVariable={toggleStarredVariable}
                    constraints={markerVariableConstraints}
                    overlayConfiguration={
                      activeOverlayConfig.value as OverlayConfig
                    }
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
            },
            {
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
                      analysisState.analysis?.descriptor.starredVariables ?? []
                    }
                    toggleStarredVariable={toggleStarredVariable}
                    configuration={activeMarkerConfiguration}
                    constraints={markerVariableConstraints}
                    overlayConfiguration={
                      activeOverlayConfig.value as OverlayConfig
                    }
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
            },
            {
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
                      analysisState.analysis?.descriptor.starredVariables ?? []
                    }
                    toggleStarredVariable={toggleStarredVariable}
                    constraints={markerVariableConstraints}
                  />
                ) : (
                  <></>
                ),
            },
          ];

          const mapTypeConfigurationMenuTabs: TabbedDisplayProps<
            'markers' | 'plots'
          >['tabs'] = [
            {
              key: 'markers',
              displayName: 'Markers',
              content: markerConfigurationObjects.find(
                ({ type }) => type === activeMarkerConfigurationType
              )?.configurationMenu,
            },
            {
              key: 'plots',
              displayName: 'Supporting Plots',
              content: (
                <MapVizManagement
                  analysisState={analysisState}
                  setActiveVisualizationId={setActiveVisualizationId}
                  apps={apps}
                  activeVisualizationId={appState.activeVisualizationId}
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
                activeMarkerConfigurationType={activeMarkerConfigurationType}
                markerConfigurations={markerConfigurationObjects}
                mapTypeConfigurationMenuTabs={mapTypeConfigurationMenuTabs}
              />
            </div>
          );
        },
      },
      {
        labelText: MapSideNavItemLabels.Filter,
        icon: <FilterIcon />,
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
                          : getDefaultVariableDescriptor(
                              variableValue?.entityId
                            ).variableId,
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
        renderSideNavigationPanel: () => {
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
                analysisState={
                  isSavedAnalysis(analysisState.analysis)
                    ? analysisState
                    : undefined
                }
                subsettingClient={subsettingClient}
                studyRecord={studyRecord}
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

  function isMapTypeSubMenuItemSelected() {
    const mapTypeSideNavObject = sideNavigationButtonConfigurationObjects.find(
      (navObject) => navObject.labelText === MapSideNavItemLabels.ConfigureMap
    );
    if (
      mapTypeSideNavObject &&
      'subMenuConfig' in mapTypeSideNavObject &&
      mapTypeSideNavObject.subMenuConfig
    ) {
      return !!mapTypeSideNavObject.subMenuConfig.find(
        (mapType) => mapType.id === activeSideMenuId
      );
    } else {
      return false;
    }
  }

  function areMapTypeAndActiveVizCompatible() {
    if (!appState.activeVisualizationId) return false;
    const visualization = analysisState.getVisualization(
      appState.activeVisualizationId
    );
    return (
      visualization?.descriptor.applicationContext ===
      activeMarkerConfigurationType
    );
  }

  const intialActiveSideMenuId: string | undefined = (() => {
    if (
      appState.activeVisualizationId &&
      appState.activeMarkerConfigurationType &&
      MarkerTypeLabels[appState.activeMarkerConfigurationType]
    )
      return (
        MapSideNavItemLabels.ConfigureMap +
        MarkerTypeLabels[appState.activeMarkerConfigurationType]
      );

    return undefined;
  })();

  // activeSideMenuId is derived from the label text since labels must be unique in a navigation menu
  const [activeSideMenuId, setActiveSideMenuId] = useState<string | undefined>(
    intialActiveSideMenuId
  );

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const [sideNavigationIsExpanded, setSideNavigationIsExpanded] =
    useState<boolean>(true);

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
    const zIndexFactor = sideNavigationIsExpanded ? 2 : 10;
    return index + zIndexFactor;
  }

  const legendZIndex =
    getZIndexByPanelTitle(DraggablePanelIds.LEGEND_PANEL) +
    getZIndexByPanelTitle(DraggablePanelIds.VIZ_PANEL);

  return (
    <PromiseResult state={appsPromiseState}>
      {(apps: ComputationAppOverview[]) => {
        const activeSideNavigationItemMenu = getSideNavigationItemMenu();

        function getSideNavigationItemMenu() {
          if (activeSideMenuId == null) return <></>;
          return sideNavigationButtonConfigurationObjects
            .find((navItem) => {
              if (navItem.labelText === activeSideMenuId) return true;
              if ('subMenuConfig' in navItem && navItem.subMenuConfig) {
                return navItem.subMenuConfig.find(
                  (subNavItem) => subNavItem.id === activeSideMenuId
                );
              }
              return false;
            })
            ?.renderSideNavigationPanel(apps);
        }

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
                  <MapSideNavigation
                    isExpanded={sideNavigationIsExpanded}
                    onToggleIsExpanded={() =>
                      setSideNavigationIsExpanded((isExpanded) => !isExpanded)
                    }
                    siteInformationProps={props.siteInformationProps}
                    activeNavigationMenu={activeSideNavigationItemMenu}
                  >
                    <SideNavigationItems
                      activeSideMenuId={activeSideMenuId}
                      itemConfigObjects={
                        sideNavigationButtonConfigurationObjects
                      }
                      setActiveSideMenuId={setActiveSideMenuId}
                    />
                  </MapSideNavigation>
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

                {/* )} */}
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

                {activeSideMenuId && isMapTypeSubMenuItemSelected() && (
                  <DraggableVisualization
                    analysisState={analysisState}
                    setActiveVisualizationId={setActiveVisualizationId}
                    appState={appState}
                    apps={apps}
                    plugins={plugins}
                    geoConfigs={geoConfigs}
                    totalCounts={totalCounts}
                    filteredCounts={filteredCounts}
                    toggleStarredVariable={toggleStarredVariable}
                    filters={filtersIncludingViewportAndTimeSlider}
                    // onTouch={moveVizToTop}
                    zIndexForStackingContext={getZIndexByPanelTitle(
                      DraggablePanelIds.VIZ_PANEL
                    )}
                    additionalRenderCondition={areMapTypeAndActiveVizCompatible}
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

type SideNavItemsProps = {
  itemConfigObjects: SideNavigationItemConfigurationObject[];
  activeSideMenuId: string | undefined;
  setActiveSideMenuId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

function SideNavigationItems({
  itemConfigObjects,
  activeSideMenuId,
  setActiveSideMenuId,
}: SideNavItemsProps) {
  const theme = useUITheme();
  const sideNavigationItems = itemConfigObjects.map(
    ({
      labelText,
      icon,
      onToggleSideMenuItem = () => {},
      subMenuConfig = [],
    }) => {
      /**
       * if subMenuConfig.length doesn't exist, we render menu items the same as before sub-menus were added
       */
      if (!subMenuConfig.length) {
        const isActive = activeSideMenuId === labelText;
        return (
          <li
            key={labelText}
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
            <button
              style={buttonStyles}
              onClick={() => {
                onToggleSideMenuItem(activeSideMenuId === labelText);
                setActiveSideMenuId((currentId) => {
                  return currentId === labelText ? undefined : labelText;
                });
              }}
            >
              <span style={iconStyles} aria-hidden>
                {icon}
              </span>
              <span style={labelStyles}>{labelText}</span>
            </button>
          </li>
        );
      } else {
        /**
         * If subMenuConfig has items, we nest a <ul> and map over the items.
         * Note that the isActive style gets applied to the nested <ul> items, not the parent
         */
        return (
          <li
            key={labelText}
            style={{
              // These styles format the lefthand side menu items.
              // Nothing special here. We can conditionally apply
              // styles based on in/active states, if we like.
              width: '100%',
              transition: 'background 0.1s ease',
              padding: '5px 10px',
              fontWeight: 'normal',
              background: 'inherit',
            }}
          >
            <button style={buttonStyles}>
              <span style={iconStyles} aria-hidden>
                {icon}
              </span>
              <span style={labelStyles}>{labelText}</span>
            </button>
            <ul>
              {subMenuConfig.map((item) => {
                return (
                  <li
                    key={item.id}
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
                      fontWeight:
                        activeSideMenuId === item.id ? 'bold' : 'normal',
                      background:
                        activeSideMenuId === item.id
                          ? theme?.palette.primary.hue[100]
                          : 'inherit',
                    }}
                  >
                    <button
                      style={buttonStyles}
                      onClick={() => {
                        onToggleSideMenuItem(activeSideMenuId === item.id);
                        setActiveSideMenuId((currentId) => {
                          return currentId === item.id ? undefined : item.id;
                        });
                        item.onClick();
                      }}
                    >
                      {/* *
                       * This div contains a checkmark that indicates which map type is active. The checkmark persists even if a different side nav item is selected.
                       */}
                      <div
                        style={{
                          marginRight: '0.5em',
                          width: '1em',
                          height: '1em',
                        }}
                      >
                        {item.isActive && <CheckIcon />}
                      </div>
                      <span style={{ fontSize: '0.9em', marginRight: '0.5em' }}>
                        {item.labelText}
                      </span>
                      <span style={iconStyles} aria-hidden>
                        {item.icon}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      }
    }
  );
  return (
    <div>
      <ul style={{ margin: 0, padding: 0 }}>{sideNavigationItems}</ul>
    </div>
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
