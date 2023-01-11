import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

import { Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { BoundsViewport, Viewport } from '@veupathdb/components/lib/map/Types';
import { FilledButton, FloatingButton } from '@veupathdb/coreui';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { PromiseResult } from '../..';
import { useCheckedLegendItems } from '../../hooks/checkedLegendItemsStatus';
import { useEntityCounts } from '../../hooks/entityCounts';
import { useGeoConfig } from '../../hooks/geoConfig';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { usePromise } from '../../hooks/promise';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import { useVizConfig } from '../../hooks/visualizations';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
} from '../../hooks/workspace';
import {
  FullScreenAppPlugin,
  FullScreenComponentProps,
} from '../../types/fullScreenApp';
import { StudyMetadata } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import { Computation, Visualization } from '../../types/visualization';
import { VariablesByInputName } from '../../utils/data-element-constraints';
import { entityToGeoConfig } from '../../utils/geoVariables';
import {
  filtersFromBoundingBox,
  leafletZoomLevelToGeohashLevel,
} from '../../utils/visualization';
import { ComputationPlugin } from '../computations/Types';
import { ZeroConfigWithButton } from '../computations/ZeroConfiguration';
import { FloatingLayout } from '../layouts/FloatingLayout';
import { LayoutOptions } from '../layouts/types';
import { barplotVisualization } from '../visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../visualizations/implementations/BoxplotVisualization';
import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import { lineplotVisualization } from '../visualizations/implementations/LineplotVisualization';
import { defaultAnimation } from '../visualizations/implementations/MapVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../visualizations/implementations/ScatterplotVisualization';
import { InputVariables } from '../visualizations/InputVariables';
import { OverlayOptions } from '../visualizations/options/types';
import { VisualizationPlugin } from '../visualizations/VisualizationPlugin';
import {
  FullScreenVisualization,
  NewVisualizationPickerModal,
} from '../visualizations/VisualizationsContainer';
import { MiniMap } from './MiniMap';
import PluginError from '../visualizations/PluginError';

const MapState = t.type({
  viewport: t.type({
    center: t.tuple([t.number, t.number]),
    zoom: t.number,
  }),
  mouseMode: t.keyof({
    default: null,
    magnification: null,
  }),
  overlayVariable: t.union([t.undefined, VariableDescriptor]),
  markerType: t.keyof({
    pie: null,
    count: null,
    proportion: null,
  }),
  computation: Computation,
  checkedLegendItems: t.union([t.undefined, t.array(t.string)]),
});

const defaultMapState: t.TypeOf<typeof MapState> = {
  viewport: {
    center: [0, 0],
    zoom: 1,
  },
  mouseMode: 'default',
  overlayVariable: undefined,
  markerType: 'pie',
  computation: {
    computationId: 'fsm',
    descriptor: {
      type: 'pass',
      configuration: undefined,
    },
    visualizations: [],
  },
  checkedLegendItems: undefined,
};

function FullScreenMap(props: FullScreenComponentProps) {
  const [appState, setAppState] = useVizConfig(
    props.appState,
    MapState,
    () => defaultMapState,
    props.persistAppState
  );

  // Define plugins inside component so that we can access appState in the getOverlayVariable option.
  // This is needed to prevent issues where the pass app does not accept a configuration object.
  // It also allows us to avoid duplicating state in both appState and compute config.
  const plugin = useMemo((): ComputationPlugin => {
    function vizWithOptions(
      visualization: VisualizationPlugin<LayoutOptions & OverlayOptions>
    ) {
      return visualization.withOptions({
        hideFacetInputs: true,
        layoutComponent: FloatingLayout,
        getOverlayVariable: (_) => appState.overlayVariable,
        getOverlayVariableHelp: () =>
          'The overlay variable can be selected via the top-right panel.',
        getCheckedLegendItems: (_) => appState.checkedLegendItems,
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
  }, [appState.checkedLegendItems, appState.overlayVariable]);

  const { viewport, mouseMode } = appState;

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const onViewportChanged = useCallback(
    (viewport: Viewport) => {
      setAppState({ viewport });
    },
    [setAppState]
  );

  const onMouseModeChange = useCallback(
    (mouseMode: MouseMode) => {
      setAppState({ mouseMode });
    },
    [setAppState]
  );

  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();

  const geoConfig = useGeoConfig(studyEntities)[0];
  if (geoConfig == null)
    throw new Error('Something is wrong with the geo config');

  const {
    markers = [],
    pending,
    legendItems,
    vocabulary,
    basicMarkerError,
    overlayError,
    totalEntityCount,
  } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters: props.analysisState.analysis?.descriptor.subset.descriptor,
    xAxisVariable: appState.overlayVariable,
    computationType: 'pass',
    markerType: appState.markerType,
    checkedLegendItems: appState.checkedLegendItems,
    //TO DO: maybe dependentAxisLogScale
  });

  const selectedVariables = {
    overlay: appState.overlayVariable,
  };

  const setSelectedVariables = useCallback(
    (selectedVariables: VariablesByInputName) => {
      setAppState({
        overlayVariable: selectedVariables.overlay,
        checkedLegendItems: undefined,
        // reset marker type to pie if no overlay var
        ...(selectedVariables.overlay == null ? { markerType: 'pie' } : {}),
      });
    },
    [setAppState]
  );

  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  const dataClient = useDataClient();
  const appPromiseState = usePromise(
    useCallback(async () => {
      const { apps } = await dataClient.getApps();
      const app = apps.find((a) => a.name === 'pass');
      if (app == null) throw new Error('Could not find pass app.');
      return app;
    }, [dataClient])
  );

  const [activeVizId, setActiveVizId] = useState<string>();

  const activeViz = appState.computation.visualizations.find(
    (viz) => viz.visualizationId === activeVizId
  );

  const onVisualizationCreated = useCallback((visualizationId: string) => {
    setActiveVizId(visualizationId);
    setIsSelectorModalOpen(false);
  }, []);

  const updateVisualizations = useCallback(
    (
      visualizations:
        | Visualization[]
        | ((visualizations: Visualization[]) => Visualization[])
    ) => {
      setAppState({
        computation: {
          ...appState.computation,
          visualizations:
            typeof visualizations === 'function'
              ? visualizations(appState.computation.visualizations)
              : visualizations,
        },
      });
    },
    [appState.computation, setAppState]
  );

  const filters = useMemo(() => {
    const viewportFilters = boundsZoomLevel
      ? filtersFromBoundingBox(
          boundsZoomLevel.bounds,
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
    boundsZoomLevel,
    geoConfig.entity.id,
    geoConfig.latitudeVariableId,
    geoConfig.longitudeVariableId,
    props.analysisState.analysis?.descriptor.subset.descriptor,
  ]);

  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(filters);

  // to avoid double-triggering of the `data = usePromise(...` in visualizations
  // (first triggered when `filters` changes, then again when `filteredCounts.pending`
  // goes from true to false)
  //
  // only allow `filters` prop for the floating visualization to change
  // when the `filteredCounts` has gone into pending state
  const [filtersForViz, setFiltersForViz] = useState(filters);
  useEffect(() => {
    if (filteredCounts.pending) setFiltersForViz(filters);
  }, [filters, filteredCounts.pending]);

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  const [checkedLegendItems, setCheckedLegendItems] = useCheckedLegendItems(
    legendItems,
    appState.checkedLegendItems,
    setAppState,
    vocabulary
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
                visualizations.filter((v) => v.visualizationId !== activeVizId)
              );
              setActiveVizId(undefined);
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
              setActiveVizId(vizCopyId);
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
            setActiveVizId(undefined);
          }}
        >
          <i className="fa fa-window-minimize" />
        </Link>
      </Tooltip>
    </>
  );

  return (
    <>
      <PromiseResult state={appPromiseState}>
        {(app) => {
          return (
            <NewVisualizationPickerModal
              visible={isSelectorModalOpen}
              onVisibleChange={setIsSelectorModalOpen}
              computation={appState.computation}
              updateVisualizations={updateVisualizations}
              visualizationPlugins={plugin.visualizationPlugins}
              visualizationsOverview={app.visualizations}
              geoConfigs={[geoConfig]}
              onVisualizationCreated={onVisualizationCreated}
            />
          );
        }}
      </PromiseResult>
      <MapVEuMap
        height="100%"
        width="100%"
        showMouseToolbar
        showSpinner={pending}
        animation={defaultAnimation}
        viewport={viewport}
        markers={markers}
        mouseMode={mouseMode}
        flyToMarkers={
          markers &&
          markers.length > 0 &&
          isEqual(viewport, defaultMapState.viewport)
        }
        flyToMarkersDelay={500}
        onBoundsChanged={setBoundsZoomLevel}
        onViewportChanged={onViewportChanged}
        onMouseModeChange={onMouseModeChange}
        showGrid={geoConfig?.zoomLevelToAggregationLevel != null}
        zoomLevelToGeohashLevel={geoConfig?.zoomLevelToAggregationLevel}
      />
      <div
        style={{
          position: 'fixed',
          top: 70,
          right: 12,
          minHeight: '20em',

          width: '23em',
          zIndex: 2000,
          background: 'white',
          padding: '1em',
        }}
      >
        <InputVariables
          inputs={[{ name: 'overlay', label: 'Overlay' }]}
          entities={studyEntities}
          selectedVariables={selectedVariables}
          onChange={setSelectedVariables}
          starredVariables={
            props.analysisState.analysis?.descriptor.starredVariables ?? []
          }
          toggleStarredVariable={toggleStarredVariable}
        />
        {legendItems.length > 0 && appState.overlayVariable && (
          <PlotLegend
            type="list"
            legendItems={legendItems}
            checkedLegendItems={checkedLegendItems}
            onCheckedLegendItemsChange={setCheckedLegendItems}
            showOverlayLegend={true}
            containerStyles={{
              border: 'none',
              boxShadow: 'none',
              padding: '0 0 0 5px',
            }}
          />
        )}
        <RadioButtonGroup
          disabledList={
            appState.overlayVariable ? [] : ['pie', 'count', 'proportion']
          }
          label="Overlay marker type"
          options={['pie', 'count', 'proportion']}
          optionLabels={['Pie', 'Count', 'Proportion']}
          selectedOption={appState.markerType}
          onOptionSelected={(markerType: any) => setAppState({ markerType })}
        />
        <div>
          <FilledButton
            onPress={() => setIsSelectorModalOpen(true)}
            text="New visualization"
            textTransform="none"
            icon={AddIcon}
            themeRole="primary"
          />
        </div>
        <div>
          {appState.computation.visualizations.map((viz) => (
            <div
              style={{
                background:
                  viz.visualizationId === activeVizId ? 'yellow' : 'none',
              }}
            >
              <FloatingButton
                onPress={() => setActiveVizId(viz.visualizationId)}
                themeRole="primary"
                text={`${viz.displayName} (${viz.descriptor.type})`}
                textTransform="none"
                styleOverrides={{
                  container: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    display: 'block',
                    textAlign: 'left',
                  },
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {activeViz && (
        <div
          style={{
            transform: 'scale(0.9)',
            background: 'white',
            minHeight: '10em',
            minWidth: '12em',
            width: '65em',
            position: 'fixed',
            left: 0,
            bottom: 0,
            zIndex: 2000,
            padding: '0 1em',
          }}
        >
          <PromiseResult state={appPromiseState}>
            {(app) => (
              <FullScreenVisualization
                analysisState={props.analysisState}
                computation={appState.computation}
                updateVisualizations={updateVisualizations}
                visualizationPlugins={plugin.visualizationPlugins}
                visualizationsOverview={app.visualizations}
                geoConfigs={[geoConfig]}
                computationAppOverview={app}
                filters={filtersForViz}
                starredVariables={
                  props.analysisState.analysis?.descriptor.starredVariables ??
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
      {/* Position error messages at the bottom of the screen and above other elements. */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          right: 100,
          bottom: 10,
          zIndex: 3000,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PluginError error={basicMarkerError} outputSize={totalEntityCount} />
        <PluginError error={overlayError} outputSize={totalEntityCount} />
      </div>
    </>
  );
}

function isCompatibleWithStudy(study: StudyMetadata) {
  const geoConfigs = Array.from(
    preorder(study.rootEntity, (e) => e.children ?? [])
  )
    .map((entity) => entityToGeoConfig(entity, leafletZoomLevelToGeohashLevel))
    .filter((geoConfig) => geoConfig != null);
  return geoConfigs.length > 0;
}

export const fullScreenMapPlugin: FullScreenAppPlugin = {
  fullScreenComponent: FullScreenMap,
  triggerComponent: MiniMap,
  isCompatibleWithStudy,
};
