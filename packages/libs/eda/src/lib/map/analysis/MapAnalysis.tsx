import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

import {
  AnalysisState,
  DEFAULT_ANALYSIS_NAME,
  EntityDiagram,
  Filter,
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
import { defaultViewport } from '@veupathdb/components/lib/map/config/map';
import { Bounds } from '@veupathdb/components/lib/map/Types';
import { useGeoConfig } from '../../core/hooks/geoConfig';
import { DocumentationContainer } from '../../core/components/docs/DocumentationContainer';
import { FilledButton, FloatingButton, Modal, Plus } from '@veupathdb/coreui';
import {
  useEntityCounts,
  useSpecificEntityCounts,
} from '../../core/hooks/entityCounts';
import ShowHideVariableContextProvider from '../../core/utils/show-hide-variable-context';
import {
  AppState,
  LegacyRedirectState,
  MapSelection,
  MarkerConfiguration,
  MarkerType,
} from './appState';
import { useAppState } from './useAppState';
import Subsetting from '../../workspace/Subsetting';
import {
  FilterList,
  FolderOpen,
  GetApp,
  InfoOutlined,
  Notes,
  Share,
  Tune,
} from '@material-ui/icons';
import { ComputationAppOverview } from '../../core/types/visualization';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import Login from '../../workspace/sharing/Login';
import { useLoginCallbacks } from '../../workspace/sharing/hooks';
import NameAnalysis from '../../workspace/sharing/NameAnalysis';
import NotesTab from '../../workspace/NotesTab';
import ConfirmShareAnalysis from '../../workspace/sharing/ConfirmShareAnalysis';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { uniq } from 'lodash';
import Path from 'path';
import DownloadTab from '../../workspace/DownloadTab';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import { AllAnalyses } from '../../workspace/AllAnalyses';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { isSavedAnalysis } from '../../core/utils/analysis';
import { GeoConfig } from '../../core/types/geoConfig';
import { VariableDescriptor } from '../../core/types/variable';
import { SiteInformationProps } from './Types';
import {
  barMarkerPlugin,
  bubbleMarkerPlugin,
  donutMarkerPlugin,
} from './mapTypes';
import { MapTypePlugin, MarkerSummary } from './mapTypes/types';
import {
  getActiveGeoConfig,
  isApproxSameViewport,
  selectionFilterFuncs,
  timeSliderLittleFilter,
} from './mapTypes/shared';
import AnalysisNameDialog from '../../workspace/AnalysisNameDialog';
import { Page } from '@veupathdb/wdk-client/lib/Components';
import { AnalysisError } from '../../core/components/AnalysisError';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';
import DatasetManagementController from '@veupathdb/user-datasets/lib/Components/Management/DatasetManagementController';
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { GeoCoordUIState } from '../../core/components/filter/geoCoordUIState';
import { makeEntityDisplayName } from '../../core/utils/study-metadata';
import { LittleFilterFunc, useLittleFilters } from './littleFilters';
import { mapCountTooltip } from './layout/mapCountTooltip';
import { MapTopBar } from './layout/MapTopBar';
import { MapFilterBar } from './layout/MapFilterBar';
import { ToolRail, ToolRailItem } from './layout/ToolRail';
import { Sheet } from './layout/Sheet';
import { MapSettingsPanel } from './layout/MapSettingsPanel';
import { LegendCard } from './layout/LegendCard';
import { useHoldKey } from './layout/useHoldKey';
import { TextButton } from './layout/ui';
import { MapSelectionToolbar } from './selection/MapSelectionToolbar';
import { SelectionPanel } from './selection/SelectionPanel';
import {
  ContextPopupTarget,
  MapContextMenuEvents,
  MapContextPopup,
  MapFitBounds,
  MapResizeObserver,
} from './selection/MapContextPopup';
import { useMapSelection } from './selection/useMapSelection';
import {
  filtersWithSelection,
  geoCoordUIStateForSelection,
  geoCoordUIStateKey,
} from './selection/filterToSelection';
import { isCovered } from './utils/geohashSelection';
import { lineageEntities, variablesOutsideLineage } from './utils/geoEntities';
import {
  configurationsForStyle,
  shareMarkerSettings,
  withVariable,
} from './utils/markerConfigurations';

const NO_LITTLE_FILTERS: LittleFilterFunc[] = [];

const mapTypePlugins: MapTypePlugin[] = [
  donutMarkerPlugin,
  barMarkerPlugin,
  bubbleMarkerPlugin,
];

type SheetId = 'filter' | 'download' | 'notes' | 'analyses' | 'study' | 'share';
type RailId = SheetId | 'settings';

const railItems: ToolRailItem<RailId>[] = [
  {
    id: 'settings',
    label: 'Map',
    title: 'Map settings: marker style and variable',
    icon: <Tune />,
  },
  {
    id: 'filter',
    label: 'Filter',
    title: 'Filter the data (subset)',
    icon: <FilterList />,
  },
  { id: 'download', label: 'Download', icon: <GetApp /> },
  { id: 'notes', label: 'Notes', icon: <Notes /> },
];

const railBottomItems: ToolRailItem<RailId>[] = [
  {
    id: 'analyses',
    label: 'Analyses',
    title: 'My analyses',
    icon: <FolderOpen />,
  },
  {
    id: 'study',
    label: 'Study',
    title: 'Study details',
    icon: <InfoOutlined />,
  },
];

const sheetTitles: Record<SheetId, string> = {
  filter: 'Filter data',
  download: 'Download data',
  notes: 'Notes',
  analyses: 'My analyses',
  study: 'Study details',
  share: 'Share analysis',
};

interface Props {
  analysisId?: string;
  sharingUrlPrefix?: string;
  singleAppMode?: string;
  studyId: string;
  siteInformationProps: SiteInformationProps;
  showLinkToEda?: boolean;
  enablePublicUserDatasets?: boolean;
}

export function MapAnalysis(props: Props) {
  const appStateAndSetters = useAppState(
    '@@mapApp@@',
    props.analysisId,
    props.singleAppMode
  );
  const geoConfigs = useGeoConfig(useStudyEntities());
  const location = useLocation();
  const locationState = location.state;
  const [showRedirectModal, setShowRedirectModal] = useState(
    LegacyRedirectState.is(locationState) &&
      !!locationState?.showLegacyMapRedirectModal
  );

  if (geoConfigs == null || geoConfigs.length === 0)
    return (
      <Page>
        <h1>Incompatible Study</h1>
        <div css={{ fontSize: '1.2em' }}>
          <p>This study does not contain map-specific variables.</p>
        </div>
      </Page>
    );
  if (appStateAndSetters.analysisState.error) {
    return (
      <Page>
        <AnalysisError
          error={appStateAndSetters.analysisState.error}
          baseAnalysisPath={location.pathname}
        />
      </Page>
    );
  }

  const { appState, analysisState } = appStateAndSetters;
  if (appState == null) return null;

  return (
    <>
      <Modal
        visible={showRedirectModal}
        toggleVisible={() => setShowRedirectModal(false)}
        styleOverrides={{
          content: {
            size: { height: '100%', width: '100%' },
            padding: { top: 25, right: 25, bottom: 25, left: 25 },
          },
          size: { width: 400, height: 200 },
        }}
      >
        <div className="LegacyMapRedirectModalContainer">
          <p>
            You have been redirected from the legacy PopBio map
            {LegacyRedirectState.is(locationState) &&
              locationState?.projectId &&
              ` to the same study (${locationState.projectId}) in our new map`}
            . Settings encoded in your URL are not applied but are kept in the{' '}
            <strong>Notes</strong> section (see the tools on the left).
          </p>
          <FilledButton
            text="Dismiss"
            onPress={() => setShowRedirectModal(false)}
          />
        </div>
      </Modal>
      <MapAnalysisImpl
        {...props}
        {...appStateAndSetters}
        appState={appState}
        analysisState={analysisState}
        geoConfigs={geoConfigs}
      />
    </>
  );
}

type ImplProps = Props &
  ReturnType<typeof useAppState> & {
    appState: AppState;
    analysisState: AnalysisState;
    geoConfigs: GeoConfig[];
  };

function MapAnalysisImpl(props: ImplProps) {
  const {
    appState,
    analysisState,
    analysisId,
    updateAppState,
    setViewport,
    setBoundsZoomLevel,
    setSubsetVariableAndEntity,
    sharingUrlPrefix,
    setIsSidePanelExpanded,
    setMarkerConfigurations,
    setActiveMarkerConfigurationType,
    setSelection,
    setRecordsEntityId,
    setBaseLayer,
    geoConfigs,
    setTimeSliderConfig,
    showLinkToEda = false,
    enablePublicUserDatasets = false,
  } = props;
  const { activeMarkerConfigurationType, markerConfigurations } = appState;
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyId = studyMetadata.id;
  const studyEntities = useStudyEntities(filters);
  const allStudyEntities = useStudyEntities();
  const analysisClient = useAnalysisClient();
  const dataClient = useDataClient();
  const downloadClient = useDownloadClient();
  const subsettingClient = useSubsettingClient();
  const history = useHistory();
  const { url } = useRouteMatch();
  const { enqueueSnackbar } = useSnackbar();
  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const findEntityAndVariable = useFindEntityAndVariable();

  const sharingUrl = new URL(
    sharingUrlPrefix
      ? `${sharingUrlPrefix}/${analysisId}`
      : `../${analysisId}/import`,
    window.location.href
  ).href;

  ///// location entity (multi-geo-entity support) /////

  const geoConfig = getActiveGeoConfig(appState, geoConfigs);
  const lineage = useMemo(
    () => lineageEntities(studyMetadata.rootEntity, geoConfig.entity.id),
    [studyMetadata.rootEntity, geoConfig.entity.id]
  );
  const lineageIds = useMemo(
    () => new Set(lineage.map(({ id }) => id)),
    [lineage]
  );
  const disabledVariables = useMemo(
    () => variablesOutsideLineage(allStudyEntities, lineageIds),
    [allStudyEntities, lineageIds]
  );

  /** marker configurations, with variables off the lineage replaced */
  const markerConfigurationsForLineage = useCallback(
    (lineageIdSet: ReadonlySet<string>, entityId: string) => {
      const replacement: VariableDescriptor =
        getDefaultVariableDescriptor(entityId);
      return markerConfigurations.map(
        (configuration): MarkerConfiguration => ({
          ...(lineageIdSet.has(configuration.selectedVariable.entityId)
            ? configuration
            : withVariable(configuration, replacement)),
          geoEntityId: undefined,
        })
      );
    },
    [markerConfigurations, getDefaultVariableDescriptor]
  );

  const handleGeoEntityChange = useCallback(
    (entityId: string) => {
      const nextLineageIds = new Set(
        lineageEntities(studyMetadata.rootEntity, entityId).map(({ id }) => id)
      );
      updateAppState(
        {
          geoEntityId: entityId,
          markerConfigurations: markerConfigurationsForLineage(
            nextLineageIds,
            entityId
          ),
          selection: undefined,
          recordsEntityId: undefined,
        },
        true
      );
    },
    [studyMetadata.rootEntity, updateAppState, markerConfigurationsForLineage]
  );

  const activeMarkerConfiguration = markerConfigurations.find(
    (configuration) => configuration.type === activeMarkerConfigurationType
  );
  const activeVariableIsOnLineage =
    activeMarkerConfiguration != null &&
    lineageIds.has(activeMarkerConfiguration.selectedVariable.entityId);

  // A marker variable can end up off the location entity's lineage (e.g.
  // the study default variable, or an analysis edited elsewhere); repair it
  // rather than failing to draw the map.
  useEffect(() => {
    if (activeMarkerConfiguration != null && !activeVariableIsOnLineage)
      setMarkerConfigurations(
        markerConfigurationsForLineage(lineageIds, geoConfig.entity.id)
      );
  }, [
    activeMarkerConfiguration,
    activeVariableIsOnLineage,
    setMarkerConfigurations,
    markerConfigurationsForLineage,
    lineageIds,
    geoConfig.entity.id,
  ]);

  const updateMarkerConfiguration = useCallback(
    (updatedConfiguration: unknown) => {
      if (!MarkerConfiguration.is(updatedConfiguration)) {
        console.error(
          'Ignoring an invalid marker configuration',
          updatedConfiguration
        );
        return;
      }
      // one marker variable for all styles (see utils/markerConfigurations)
      setMarkerConfigurations(
        shareMarkerSettings(markerConfigurations, updatedConfiguration)
      );
    },
    [markerConfigurations, setMarkerConfigurations]
  );

  const handleMarkerStyleChange = useCallback(
    (type: MarkerType) => {
      const nextConfigurations = configurationsForStyle(
        markerConfigurations,
        activeMarkerConfigurationType,
        type
      );
      if (nextConfigurations === markerConfigurations)
        setActiveMarkerConfigurationType(type);
      else
        updateAppState(
          {
            activeMarkerConfigurationType: type,
            markerConfigurations: nextConfigurations,
          },
          true
        );
    },
    [
      markerConfigurations,
      activeMarkerConfigurationType,
      setActiveMarkerConfigurationType,
      updateAppState,
    ]
  );

  const activePlugin = mapTypePlugins.find(
    ({ type }) => type === activeMarkerConfigurationType
  );

  ///// counts, panels and sheets /////

  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(filters);

  // The filter bar's count, as in the pre-redesign map header: the subset,
  // narrowed by the timeline window and the marker configuration (has a
  // value for the marker variable). Neither applies while markers can't be
  // drawn. The timeline's own bars use the marker configuration only.
  const canDrawMarkers = activePlugin != null && activeVariableIsOnLineage;
  const timelineFilterFuncs = useMemo(
    () =>
      canDrawMarkers && activePlugin != null
        ? activePlugin.markerConfigFilterFuncs
        : NO_LITTLE_FILTERS,
    [canDrawMarkers, activePlugin]
  );
  const countFilterFuncs = useMemo(
    () =>
      canDrawMarkers
        ? [...timelineFilterFuncs, timeSliderLittleFilter]
        : NO_LITTLE_FILTERS,
    [canDrawMarkers, timelineFilterFuncs]
  );
  const littleFilterProps = useMemo(
    () => ({ filters, appState, geoConfigs }),
    [filters, appState, geoConfigs]
  );
  const { filters: timelineFilters } = useLittleFilters(
    littleFilterProps,
    timelineFilterFuncs
  );
  const { filters: mapCountFilters } = useLittleFilters(
    littleFilterProps,
    countFilterFuncs
  );
  const geoEntityList = useMemo(() => [geoConfig.entity], [geoConfig.entity]);
  const mapCounts = useSpecificEntityCounts(mapCountFilters, geoEntityList);
  const timeSliderConfig = appState.timeSliderConfig;
  const timeWindow =
    canDrawMarkers &&
    timeSliderConfig?.variable != null &&
    timeSliderConfig.active &&
    timeSliderConfig.selectedRange != null
      ? timeSliderConfig.selectedRange
      : undefined;

  const isSettingsPanelOpen = appState.isSidePanelExpanded ?? true;

  // "peek": hide the markers only while H (or the legend's eye button) is
  // held, to see the map underneath; never persisted
  const isHideMarkersKeyHeld = useHoldKey('h');
  const [isHideMarkersButtonHeld, setIsHideMarkersButtonHeld] = useState(false);
  const markersHidden = isHideMarkersKeyHeld || isHideMarkersButtonHeld;
  const [activeSheet, setActiveSheet] = useState<SheetId>();
  const [isSelectionPanelOpen, setIsSelectionPanelOpen] = useState(
    appState.selection != null
  );
  const closeSheet = useCallback(() => setActiveSheet(undefined), []);

  const handleRailSelect = (id: RailId) => {
    if (id === 'settings') {
      setActiveSheet(undefined);
      setIsSidePanelExpanded(!isSettingsPanelOpen);
    } else {
      setActiveSheet(activeSheet === id ? undefined : id);
    }
  };

  const subsetVariableAndEntity = useMemo(
    () => appState.subsetVariableAndEntity ?? getDefaultVariableDescriptor(),
    [appState.subsetVariableAndEntity, getDefaultVariableDescriptor]
  );

  const openFilters = useCallback(
    (variable?: { entityId: string; variableId: string }) => {
      if (variable) setSubsetVariableAndEntity(variable);
      setActiveSheet('filter');
    },
    [setSubsetVariableAndEntity]
  );

  ///// selection /////

  // fit the map to the markers once, if the analysis opens at the default
  // (never moved) view; see InitialFitProps
  const [isInitialFitPending, setIsInitialFitPending] = useState(() =>
    isApproxSameViewport(appState.viewport, defaultViewport)
  );
  const initialFit = useMemo(
    () => ({
      pending: isInitialFitPending,
      onStarted: () => setIsInitialFitPending(false),
    }),
    [isInitialFitPending]
  );

  // "Zoom to data" (zoom control): the map first returns to the default
  // world view, which fetches markers for all the data, then the one-shot
  // fit is re-armed. Arm it only once the world view's bounds have arrived:
  // that render also starts the new marker request, so the fit waits for
  // the new markers instead of fitting the old, zoomed-in ones.
  const zoomToDataRequestedRef = useRef(false);
  const handleZoomToData = useCallback(() => {
    if (appState.boundsZoomLevel?.zoomLevel === defaultViewport.zoom)
      // already at the world view: its markers are (being) loaded
      setIsInitialFitPending(true);
    else zoomToDataRequestedRef.current = true;
  }, [appState.boundsZoomLevel]);
  useEffect(() => {
    if (
      zoomToDataRequestedRef.current &&
      appState.boundsZoomLevel?.zoomLevel === defaultViewport.zoom
    ) {
      zoomToDataRequestedRef.current = false;
      setIsInitialFitPending(true);
    }
  }, [appState.boundsZoomLevel]);

  const [contextTarget, setContextTarget] = useState<ContextPopupTarget>();
  const [fitBoundsRequest, setFitBoundsRequest] = useState<{
    bounds: Bounds;
  }>();
  const zoomTo = useCallback(
    (bounds: Bounds) => setFitBoundsRequest({ bounds }),
    []
  );

  const openSelectionPanel = useCallback(
    () => setIsSelectionPanelOpen(true),
    []
  );
  const showMarkerContextPopup = useCallback(
    (marker: MarkerSummary) =>
      setContextTarget({ kind: 'marker', marker, isSelected: false }),
    []
  );
  const setSelectionOrClear = useCallback(
    (selection: MapSelection | undefined) => setSelection(selection),
    [setSelection]
  );

  const selection = useMapSelection({
    appState,
    geoConfig,
    setSelection: setSelectionOrClear,
    onSelected: openSelectionPanel,
    onMarkerContextMenu: showMarkerContextPopup,
  });

  const { filters: recordFilters } = useLittleFilters(
    { filters, appState, geoConfigs },
    selectionFilterFuncs
  );

  const handleFilterToSelection = useCallback(() => {
    const result = filtersWithSelection(
      filters ?? [],
      geoConfig,
      selection.prefixes
    );
    if (result == null) {
      enqueueSnackbar(
        'The selection is outside the current geographic filter.',
        { variant: 'warning' }
      );
      return;
    }
    analysisState.setFilters(result.filters);
    const uiStateKey = geoCoordUIStateKey(geoConfig);
    analysisState.setVariableUISettings((previous) => ({
      ...previous,
      [uiStateKey]: geoCoordUIStateForSelection(
        pipe(
          GeoCoordUIState.decode(previous[uiStateKey]),
          getOrElseW(() => undefined)
        ),
        result.prefixSet,
        appState.viewport
      ),
    }));
    selection.clearSelection();
    enqueueSnackbar(
      'Filtered to the selected locations. Edit or remove the filter in the filter bar.',
      { variant: 'success' }
    );
  }, [
    filters,
    geoConfig,
    selection,
    analysisState,
    appState.viewport,
    enqueueSnackbar,
  ]);

  const handleMapClick = useCallback(() => {
    setContextTarget(undefined);
    if (selection.hasSelection && !selection.lassoActive)
      selection.clearSelection();
  }, [selection]);

  ///// analysis-level things (share, login, new analysis) /////

  const userLoggedIn = useWdkService(async (wdkService) => {
    const user = await wdkService.getCurrentUser();
    return !user.isGuest;
  });

  function showLoginForm() {
    const currentUrl = window.location.href;
    const loginUrl = `${props.siteInformationProps.loginUrl}?destination=${currentUrl}`;
    history.push(loginUrl);
  }

  const loginCallbacks = useLoginCallbacks({
    showLoginForm,
    toggleVisible: closeSheet,
  });

  const appsPromiseState = usePromise(
    useCallback(async () => {
      const { apps } = await dataClient.getApps();
      return apps;
    }, [dataClient])
  );

  const [isAnalysisNameDialogOpen, setIsAnalysisNameDialogOpen] =
    useState(false);
  const redirectURL = studyId
    ? url.endsWith(studyId)
      ? `/workspace/${url}/new`
      : Path.resolve(url, '../new')
    : null;
  const redirectToNewAnalysis = useCallback(() => {
    if (redirectURL) history.push(redirectURL);
  }, [history, redirectURL]);

  const filteredEntities = uniq(filters?.map((f) => f.entityId));

  function renderSheetContents(sheet: SheetId): ReactNode {
    switch (sheet) {
      case 'filter':
        return (
          <>
            <div
              css={{
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
          </>
        );
      case 'download':
        return (
          <DownloadTab
            downloadClient={downloadClient}
            analysisState={analysisState}
            totalCounts={totalCounts.value}
            filteredCounts={filteredCounts.value}
          />
        );
      case 'notes':
        return <NotesTab analysisState={analysisState} />;
      case 'share':
        if (!analysisState.analysis) return null;
        return (
          <div css={{ display: 'flex', justifyContent: 'center' }}>
            {!userLoggedIn ? (
              <Login {...loginCallbacks} showCloseButton={false} />
            ) : analysisState.analysis.displayName === DEFAULT_ANALYSIS_NAME ? (
              <NameAnalysis
                currentName={analysisState.analysis.displayName}
                updateName={analysisState.setName}
              />
            ) : (
              <ConfirmShareAnalysis sharingUrl={sharingUrl} />
            )}
          </div>
        );
      case 'analyses':
        return (
          <div
            css={{
              h1: {
                fontSize: '1.75em',
                margin: '25px 0 0 0',
                padding: '0 0 1em 0',
              },
              '.MesaComponent .DataTable': { fontSize: 'inherit' },
            }}
          >
            {analysisId && redirectToNewAnalysis && (
              <div css={{ float: 'right' }}>
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
      case 'study':
        return (
          <div css={{ fontSize: '.95em' }}>
            {studyMetadata.isUserStudy ? (
              // Note that we are not including the custom detail page.
              // As of this writing, details pages only add a link to
              // EDA. Since we are in EDA, we don't want to add it here.
              <DatasetManagementController
                baseUrl={url}
                detailsPageTitle={'My Study'}
                workspaceTitle={'My Studies'}
                id={wdkRecordIdToDiyUserDatasetId(
                  studyRecord.attributes.dataset_id as string
                )}
                dataNoun={{ singular: 'Study', plural: 'Studies' }}
                enablePublicUserDatasets={enablePublicUserDatasets}
                includeAllLink={false}
                includeNameHeader={false}
                history={history}
                fetchEdaStudyLinks={(_) => ({})}
              />
            ) : (
              <RecordController
                recordClass="dataset"
                primaryKey={studyRecord.id.map((p) => p.value).join('/')}
              />
            )}
          </div>
        );
    }
  }

  const { variable: overlayVariable, entity: overlayEntity } =
    findEntityAndVariable(activeMarkerConfiguration?.selectedVariable) ?? {};

  const countTooltip = mapCountTooltip({
    entityName: makeEntityDisplayName(geoConfig.entity, true),
    timeWindow:
      timeWindow && timeSliderConfig?.variable
        ? {
            ...timeWindow,
            variableName:
              findEntityAndVariable(timeSliderConfig.variable)?.variable
                .displayName ?? 'date',
          }
        : undefined,
    markerVariableName: canDrawMarkers
      ? overlayVariable?.displayName
      : undefined,
  });

  const activeRailIds: RailId[] = [
    ...(isSettingsPanelOpen ? (['settings'] as const) : []),
    ...(activeSheet ? [activeSheet] : []),
  ];

  const contextTargetWithSelection: ContextPopupTarget | undefined =
    contextTarget?.kind === 'marker'
      ? {
          ...contextTarget,
          isSelected: isCovered(contextTarget.marker.id, selection.prefixes),
        }
      : contextTarget;

  return (
    <PromiseResult state={appsPromiseState}>
      {(apps: ComputationAppOverview[]) => {
        const sharedPluginProps = {
          apps,
          analysisState,
          appState,
          studyId,
          filters,
          studyEntities,
          geoConfigs,
          geoConfig,
          configuration: activeMarkerConfiguration,
          updateConfiguration: updateMarkerConfiguration,
        };

        return (
          <ShowHideVariableContextProvider>
            <DocumentationContainer>
              {/* The layout fills its slot but must never size it: the site
                  page column (.wdk-PageContent, a flex item with the default
                  min-height: auto) would otherwise grow to fit the docked
                  panels' content, pushing the map's bottom edge - and the
                  legend pinned to it - below the screen on small windows.
                  An absolutely positioned layout contributes no height. */}
              <div
                css={{ position: 'relative', height: '100%', width: '100%' }}
              >
                <div
                  css={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: 14,
                    // nothing in the map UI may scroll the page: a page
                    // scrollbar appearing would resize (and shift) the map
                    overflow: 'hidden',
                  }}
                >
                  <MapTopBar
                    siteInformation={props.siteInformationProps}
                    studyName={studyRecord.displayName}
                    analysisName={analysisState.analysis?.displayName}
                    onAnalysisNameEdit={analysisState.setName}
                    showLinkToEda={showLinkToEda}
                    actions={
                      <TextButton
                        onClick={() => setActiveSheet('share')}
                        title="Share a link to this analysis"
                      >
                        <span
                          css={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Share style={{ fontSize: 16 }} /> Share
                        </span>
                      </TextButton>
                    }
                  />
                  <MapFilterBar
                    filters={filters ?? []}
                    studyEntities={studyEntities}
                    geoEntity={geoConfig.entity}
                    totalCounts={totalCounts.value}
                    filteredCounts={mapCounts.value}
                    countPending={mapCounts.pending}
                    countTooltip={countTooltip}
                    onRemoveFilter={(filter: Filter) =>
                      analysisState.analysis &&
                      analysisState.setFilters(
                        analysisState.analysis.descriptor.subset.descriptor.filter(
                          (f) => f !== filter
                        )
                      )
                    }
                    onOpenFilters={openFilters}
                    selectedVariable={
                      activeSheet === 'filter'
                        ? subsetVariableAndEntity
                        : undefined
                    }
                  />
                  <div css={{ flex: 1, minHeight: 0, display: 'flex' }}>
                    <ToolRail
                      items={railItems}
                      bottomItems={railBottomItems}
                      activeIds={activeRailIds}
                      onSelect={handleRailSelect}
                    />
                    <div
                      css={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        position: 'relative',
                      }}
                    >
                      {isSettingsPanelOpen && activePlugin && (
                        <MapSettingsPanel
                          plugins={mapTypePlugins}
                          activeType={activePlugin.type}
                          onTypeChange={handleMarkerStyleChange}
                          geoConfigs={geoConfigs}
                          geoConfig={geoConfig}
                          onGeoEntityChange={handleGeoEntityChange}
                          lineageEntities={lineage}
                          onClose={() => setIsSidePanelExpanded(false)}
                        >
                          {canDrawMarkers && (
                            <activePlugin.ConfigPanelComponent
                              {...sharedPluginProps}
                              disabledVariables={disabledVariables}
                            />
                          )}
                        </MapSettingsPanel>
                      )}
                      <div
                        css={{
                          flex: 1,
                          minWidth: 0,
                          position: 'relative',
                          // clip on-map overlays (time slider, hint, legend)
                          // so they can never resize the layout around them
                          overflow: 'hidden',
                          // peek: hide markers (and their hover popups and
                          // extent boxes) without unmounting them, so they
                          // reappear instantly with no refetch or animation
                          ...(markersHidden
                            ? {
                                '.leaflet-marker-pane, .leaflet-popup-pane': {
                                  visibility: 'hidden',
                                },
                              }
                            : {}),
                        }}
                      >
                        <MapVEuMap
                          height="100%"
                          width="100%"
                          style={{ zIndex: 1 }}
                          showLayerSelector={true}
                          showSpinner={false}
                          viewport={appState.viewport}
                          onBoundsChanged={setBoundsZoomLevel}
                          onViewportChanged={setViewport}
                          baseLayer={appState.baseLayer}
                          onBaseLayerChanged={setBaseLayer}
                          showGrid={
                            geoConfig.zoomLevelToAggregationLevel !== null
                          }
                          zoomLevelToGeohashLevel={
                            geoConfig.zoomLevelToAggregationLevel
                          }
                          defaultViewport={defaultViewport}
                          onZoomToData={handleZoomToData}
                          onMapClick={handleMapClick}
                        >
                          {canDrawMarkers && (
                            <activePlugin.MapLayerComponent
                              {...sharedPluginProps}
                              selection={selection.selectionProps}
                              initialFit={initialFit}
                            />
                          )}
                          <MapResizeObserver />
                          <MapFitBounds request={fitBoundsRequest} />
                          <MapContextMenuEvents
                            onContextMenu={(position) =>
                              setContextTarget({ kind: 'point', position })
                            }
                          />
                          {contextTargetWithSelection && (
                            <MapContextPopup
                              target={contextTargetWithSelection}
                              onClose={() => setContextTarget(undefined)}
                              onSelectMarker={(marker, additive) =>
                                selection.onSelectionGesture(
                                  [marker.id],
                                  additive ? 'add' : 'replace'
                                )
                              }
                              onZoomTo={zoomTo}
                            />
                          )}
                        </MapVEuMap>
                        <MapSelectionToolbar
                          lassoActive={selection.lassoActive}
                          onToggleLasso={() =>
                            selection.setLassoActive(!selection.lassoActive)
                          }
                          hasSelection={selection.hasSelection}
                          selectedMarkerCount={selection.selectedMarkers.length}
                          onClearSelection={selection.clearSelection}
                          isSelectionPanelOpen={isSelectionPanelOpen}
                          onToggleSelectionPanel={() =>
                            setIsSelectionPanelOpen(!isSelectionPanelOpen)
                          }
                        />
                        {canDrawMarkers && (
                          <LegendCard
                            markersHidden={markersHidden}
                            onHoldToHideMarkers={setIsHideMarkersButtonHeld}
                            title={overlayVariable?.displayName ?? 'Legend'}
                            subtitle={
                              overlayEntity &&
                              `${makeEntityDisplayName(
                                overlayEntity,
                                false
                              )} variable · markers at ${makeEntityDisplayName(
                                geoConfig.entity,
                                false
                              ).toLowerCase()} locations`
                            }
                            onEdit={
                              isSettingsPanelOpen
                                ? undefined
                                : () => setIsSidePanelExpanded(true)
                            }
                          >
                            <activePlugin.LegendComponent
                              {...sharedPluginProps}
                            />
                          </LegendCard>
                        )}
                        {canDrawMarkers && (
                          <div
                            css={{
                              position: 'absolute',
                              bottom: 24,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: 2,
                              // the slider has a fixed width; on a narrow map
                              // scroll it rather than overflow the map
                              maxWidth: 'calc(100% - 20px)',
                              overflowX: 'auto',
                            }}
                          >
                            <activePlugin.TimeSliderComponent
                              {...sharedPluginProps}
                              setTimeSliderConfig={setTimeSliderConfig}
                              siteInformationProps={props.siteInformationProps}
                            />
                          </div>
                        )}
                      </div>
                      {isSelectionPanelOpen && (
                        <SelectionPanel
                          studyId={studyId}
                          studyEntities={studyEntities}
                          geoConfig={geoConfig}
                          lineageEntities={lineage}
                          hasSelection={selection.hasSelection}
                          selectedMarkers={selection.selectedMarkers}
                          recordFilters={recordFilters}
                          recordsEntityId={appState.recordsEntityId}
                          onRecordsEntityChange={setRecordsEntityId}
                          onClearSelection={selection.clearSelection}
                          onFilterToSelection={handleFilterToSelection}
                          onZoomTo={zoomTo}
                          onClose={() => setIsSelectionPanelOpen(false)}
                        />
                      )}
                      {activeSheet && (
                        <Sheet
                          title={sheetTitles[activeSheet]}
                          onClose={closeSheet}
                        >
                          {renderSheetContents(activeSheet)}
                        </Sheet>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DocumentationContainer>
          </ShowHideVariableContextProvider>
        );
      }}
    </PromiseResult>
  );
}
