import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import * as t from 'io-ts';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

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
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { useGeoConfig } from '../../core/hooks/geoConfig';
import { useMapMarkers } from '../../core/hooks/mapMarkers';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { DocumentationContainer } from '../../core/components/docs/DocumentationContainer';
import { VariableDescriptor } from '../../core/types/variable';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import {
  FullScreenVisualization,
  NewVisualizationPickerModal,
} from '../../core/components/visualizations/VisualizationsContainer';
import { FilledButton } from '@veupathdb/coreui';
import { Visualization } from '../../core/types/visualization';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import { Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { ComputationPlugin } from '../../core/components/computations/Types';
import { ZeroConfigWithButton } from '../../core/components/computations/ZeroConfiguration';
import { histogramVisualization } from '../../core/components/visualizations/implementations/HistogramVisualization';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { LayoutOptions } from '../../core/components/layouts/types';
import { OverlayOptions } from '../../core/components/visualizations/options/types';
import { FloatingLayout } from '../../core/components/layouts/FloatingLayout';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../../core/components/visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../core/components/visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../core/components/visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../../core/components/visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../core/components/visualizations/implementations/BoxplotVisualization';
import ShowHideVariableContextProvider from '../../core/utils/show-hide-variable-context';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

const mapStyle: React.CSSProperties = {
  zIndex: 1,
};

function vizPluginWithOptions(
  vizPlugin: VisualizationPlugin<LayoutOptions & OverlayOptions>
) {
  return vizPlugin.withOptions({
    hideFacetInputs: true,
    layoutComponent: FloatingLayout,
  });
}

const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationValid: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    histogram: vizPluginWithOptions(histogramVisualization),
    twobytwo: vizPluginWithOptions(twoByTwoVisualization),
    conttable: vizPluginWithOptions(contTableVisualization),
    scatterplot: vizPluginWithOptions(scatterplotVisualization),
    lineplot: vizPluginWithOptions(lineplotVisualization),
    barplot: vizPluginWithOptions(barplotVisualization),
    _boxplot: vizPluginWithOptions(boxplotVisualization),
    get boxplot() {
      return this._boxplot;
    },
    set boxplot(value) {
      this._boxplot = value;
    },
  },
};

interface Props {
  analysisId: string;
  studyId: string;
}

export function MapAnalysis(props: Props) {
  const { analysisId } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();
  const geoConfigs = useGeoConfig(studyEntities);
  const analysisState = useAnalysis(analysisId, 'pass-through');
  const geoConfig = geoConfigs[0];

  const {
    appState,
    setMouseMode,
    setSelectedOverlayVariable,
    setViewport,
    setActiveVisualizationId,
  } = useAppState('@@mapApp@@', analysisState);

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();
  const [isVizSelectorVisible, setIsVizSelectorVisible] = useState(false);

  const selectedVariables = useMemo(
    () => ({
      overlay: appState.selectedOverlayVariable,
    }),
    [appState.selectedOverlayVariable]
  );

  const findEntityAndVariable = useFindEntityAndVariable();
  const { entity, variable } =
    findEntityAndVariable(selectedVariables.overlay) ?? {};

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const {
    markers,
    pending,
    legendItems,
    basicMarkerError,
    overlayError,
    totalEntityCount,
  } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
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

  const onVisualizationCreated = useCallback(
    (visualizationId: string) => {
      setIsVizSelectorVisible(false);
      setActiveVisualizationId(visualizationId);
    },
    [setActiveVisualizationId, setIsVizSelectorVisible]
  );

  const activeViz = analysisState.analysis?.descriptor.computations
    .flatMap((c) => c.visualizations)
    .find((v) => v.visualizationId === appState.activeVisualizationId);

  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  const fullScreenActions = (
    <>
      <div>
        <Tooltip title="Delete visualization">
          <button
            type="button"
            className="link"
            onClick={() => {
              if (activeViz == null) return;
              updateVisualizations((visualizations) =>
                visualizations.filter(
                  (v) => v.visualizationId !== appState.activeVisualizationId
                )
              );
              setActiveVisualizationId(undefined);
            }}
          >
            <i className="fa fa-trash"></i>
          </button>
        </Tooltip>
      </div>
      <div>
        <Tooltip title="Copy visualization">
          <button
            type="button"
            className="link"
            onClick={() => {
              if (activeViz == null) return;
              const vizCopyId = uuid();
              updateVisualizations((visualizations) =>
                visualizations.concat({
                  ...activeViz,
                  visualizationId: vizCopyId,
                  displayName:
                    'Copy of ' +
                    (activeViz.displayName || 'unnamed visualization'),
                })
              );
              setActiveVisualizationId(vizCopyId);
            }}
          >
            <i className="fa fa-clone"></i>
          </button>
        </Tooltip>
      </div>
      <Tooltip title="Minimize visualization">
        <Link
          to=""
          onClick={(e) => {
            e.preventDefault();
            setActiveVisualizationId(undefined);
          }}
        >
          <i className="fa fa-window-minimize" />
        </Link>
      </Tooltip>
    </>
  );

  return (
    <ShowHideVariableContextProvider>
      <DocumentationContainer>
        <div
          style={{
            height: '100%',
            position: 'relative',
          }}
        >
          <MapVEuMap
            height="100%"
            width="100%"
            style={mapStyle}
            showMouseToolbar
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
            zoomLevelToGeohashLevel={geoConfig?.zoomLevelToAggregationLevel}
          />
          {legendItems.length > 0 && (
            <FloatingDiv
              style={{
                top: 50,
                right: 50,
              }}
            >
              <div>
                <strong>{variable?.displayName}</strong>
              </div>
              <PlotLegend
                type="list"
                legendItems={legendItems}
                showOverlayLegend
                checkedLegendItems={legendItems.map((item) => item.label)}
                containerStyles={{
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0,
                  width: 'auto',
                }}
              />
            </FloatingDiv>
          )}
          <FloatingDiv
            style={{
              top: 10,
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
            </div>
            <FilledButton
              text="Add a plot"
              onPress={() => setIsVizSelectorVisible(true)}
            />
            <ul>
              {analysisState.analysis?.descriptor.computations.map(
                (computation) => (
                  <li>
                    <strong>
                      {computation.displayName} ({computation.descriptor.type})
                    </strong>
                    <ul>
                      {computation.visualizations.map((viz) => (
                        <li>
                          <button
                            type="button"
                            className="link"
                            onClick={() => {
                              setActiveVisualizationId(viz.visualizationId);
                            }}
                          >
                            {viz.displayName} ({viz.descriptor.type})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </FloatingDiv>
          <FloatingDiv
            style={{
              bottom: 10,
              left: 100,
            }}
          >
            {activeViz && (
              <div
                style={{
                  transform: 'scale(0.9)',
                  background: 'white',
                  minHeight: '10em',
                  minWidth: '12em',
                  width: '65em',
                  position: 'fixed',
                  right: 0,
                  bottom: 0,
                  zIndex: 2000,
                  padding: '0 1em',
                }}
              >
                <PromiseResult state={appPromiseState}>
                  {(app) => (
                    <FullScreenVisualization
                      analysisState={analysisState}
                      computation={computation!}
                      updateVisualizations={updateVisualizations}
                      visualizationPlugins={plugin.visualizationPlugins}
                      visualizationsOverview={app.visualizations}
                      geoConfigs={[geoConfig]}
                      computationAppOverview={app}
                      filters={
                        analysisState.analysis?.descriptor.subset.descriptor ??
                        []
                      }
                      starredVariables={
                        analysisState.analysis?.descriptor.starredVariables ??
                        []
                      }
                      toggleStarredVariable={toggleStarredVariable}
                      totalCounts={totalCounts}
                      filteredCounts={filteredCounts}
                      isSingleAppMode
                      disableThumbnailCreation
                      id={activeViz.visualizationId}
                      actions={fullScreenActions}
                    />
                  )}
                </PromiseResult>
              </div>
            )}
          </FloatingDiv>
          {(basicMarkerError || overlayError) && (
            <FloatingDiv
              style={{ top: undefined, bottom: 50, left: 100, right: 100 }}
            >
              {basicMarkerError && <div>{String(basicMarkerError)}</div>}
              {overlayError && <div>{String(overlayError)}</div>}
            </FloatingDiv>
          )}
        </div>
        <PromiseResult state={appPromiseState}>
          {(app) => {
            return (
              <NewVisualizationPickerModal
                visible={isVizSelectorVisible}
                onVisibleChange={setIsVizSelectorVisible}
                computation={computation!}
                updateVisualizations={updateVisualizations}
                visualizationPlugins={plugin.visualizationPlugins}
                visualizationsOverview={app.visualizations}
                geoConfigs={[geoConfig]}
                onVisualizationCreated={onVisualizationCreated}
              />
            );
          }}
        </PromiseResult>
      </DocumentationContainer>
    </ShowHideVariableContextProvider>
  );
}

function FloatingDiv(props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        padding: '1em',
        backgroundColor: 'white',
        border: '1px solid black',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    mouseMode: t.keyof({
      default: null,
      magnification: null,
    }),
  }),
  t.partial({
    selectedOverlayVariable: VariableDescriptor,
    activeVisualizationId: t.string,
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
type AppState = t.TypeOf<typeof AppState>;

const defaultAppState: AppState = {
  viewport: {
    center: [0, 0],
    zoom: 4,
  },
  mouseMode: 'default',
};

function useAppState(uiStateKey: string, analysisState: AnalysisState) {
  const { setVariableUISettings } = analysisState;
  const savedState = pipe(
    AppState.decode(
      analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey]
    ),
    getOrElse(() => defaultAppState)
  );
  const [appState, setAppState] = useState<AppState>(savedState);

  useEffect(() => {
    setAppState(savedState);
  }, [savedState]);

  function makeSetter<T extends keyof AppState>(key: T) {
    return function setter(value: AppState[T]) {
      setVariableUISettings((prev) => ({
        ...prev,
        [uiStateKey]: {
          ...appState,
          [key]: value,
        },
      }));
    };
  }

  const setViewport = makeSetter('viewport');
  const setMouseMode = makeSetter('mouseMode');
  const setSelectedOverlayVariable = makeSetter('selectedOverlayVariable');
  const setActiveVisualizationId = makeSetter('activeVisualizationId');

  return {
    appState,
    setViewport,
    setMouseMode,
    setSelectedOverlayVariable,
    setActiveVisualizationId,
  };
}
