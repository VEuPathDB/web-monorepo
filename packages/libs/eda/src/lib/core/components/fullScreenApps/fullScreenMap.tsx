import * as t from 'io-ts';
import { useCallback, useMemo, useState } from 'react';

import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { BoundsViewport, Viewport } from '@veupathdb/components/lib/map/Types';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { useVizConfig } from '../../hooks/visualizations';
import {
  FullScreenAppPlugin,
  FullScreenComponentProps,
} from '../../types/fullScreenApp';
import { StudyMetadata } from '../../types/study';
import { entityToGeoConfig } from '../../utils/geoVariables';
import {
  filtersFromBoundingBox,
  leafletZoomLevelToGeohashLevel,
} from '../../utils/visualization';
import { useMapMarkers } from '../../hooks/mapMarkers';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
} from '../../hooks/workspace';
import { useGeoConfig } from '../../hooks/geoConfig';
import {
  defaultAnimation,
  mapVisualization,
} from '../visualizations/implementations/MapVisualization';
import { isEqual } from 'lodash';
import { InputVariables } from '../visualizations/InputVariables';
import { VariablesByInputName } from '../../utils/data-element-constraints';
import { VariableDescriptor } from '../../types/variable';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { FilledButton, FloatingButton } from '@veupathdb/coreui';
import AddIcon from '@material-ui/icons/Add';
import {
  FullScreenVisualization,
  NewVisualizationPickerModal,
} from '../visualizations/VisualizationsContainer';
import { usePromise } from '../../hooks/promise';
import { PromiseResult } from '../..';
import { Computation, Visualization } from '../../types/visualization';
import { ComputationPlugin } from '../computations/Types';
import { ZeroConfigWithButton } from '../computations/ZeroConfiguration';
import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../visualizations/implementations/BoxplotVisualization';
import { FloatingLayout } from '../layouts/FloatingLayout';
import { VisualizationPlugin } from '../visualizations/VisualizationPlugin';
import { LayoutOptions } from '../layouts/types';
import { useEntityCounts } from '../../hooks/entityCounts';
import { MiniMap } from './MiniMap';

function vizWithOptions(visualization: VisualizationPlugin<LayoutOptions>) {
  return visualization.withOptions({
    hideFacetInputs: true,
    layoutComponent: FloatingLayout,
  });
}

const plugin: ComputationPlugin = {
  configurationComponent: ZeroConfigWithButton,
  isConfigurationValid: t.undefined.is,
  createDefaultConfiguration: () => undefined,
  visualizationPlugins: {
    histogram: vizWithOptions(histogramVisualization),
    twobytwo: vizWithOptions(twoByTwoVisualization),
    conttable: vizWithOptions(contTableVisualization),
    scatterplot: vizWithOptions(scatterplotVisualization),
    lineplot: vizWithOptions(lineplotVisualization),
    'map-markers': vizWithOptions(mapVisualization),
    barplot: vizWithOptions(barplotVisualization),
    boxplot: vizWithOptions(boxplotVisualization),
    // or...
    //    boxplot: boxplotVisualization.withOptions({
    //      hideFacetInputs: true,
    //      getOverlayVariable(_) {
    //	      return {
    //	        "entityId": "PCO_0000024",
    //	        "variableId": "EUPATH_0015019" // charcoal
    //	      };
    //      },
    //      layoutComponent: FloatingLayout,
    //    }), /// TEMPORARY ONLY!!! ///
  },
};

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
});

const defaultMapState: t.TypeOf<typeof MapState> = {
  viewport: {
    center: [0, 0],
    zoom: 4,
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
};

function FullScreenMap(props: FullScreenComponentProps) {
  const [appState, setAppState] = useVizConfig(
    props.appState,
    MapState,
    () => defaultMapState,
    props.persistAppState
  );
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

  const { markers = [], pending } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters: props.analysisState.analysis?.descriptor.subset.descriptor,
    xAxisVariable: appState.overlayVariable,
    computationType: 'pass',
    markerType: appState.markerType,
    //TO DO: checkedLegendItems and maybe dependentAxisLogScale
  });

  const selectedVariables = {
    overlay: appState.overlayVariable,
  };

  const setSelectedVariables = useCallback(
    (selectedVariables: VariablesByInputName) => {
      setAppState({ overlayVariable: selectedVariables.overlay });
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
              visualizationsOverview={app.visualizations!}
              geoConfigs={[geoConfig]}
              onVisualizationCreated={onVisualizationCreated}
            />
          );
        }}
      </PromiseResult>
      {/* <div style={{ position: 'relative', zIndex: 1 }}> */}
      <MapVEuMap
        height="100%"
        width="100%"
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
      />
      {/* </div> */}
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
          starredVariables={[]}
          toggleStarredVariable={() => {}}
        />
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
                visualizationsOverview={app.visualizations!}
                geoConfigs={[geoConfig]}
                computationAppOverview={app}
                filters={filters}
                starredVariables={[]}
                toggleStarredVariable={() => {}}
                totalCounts={totalCounts}
                filteredCounts={filteredCounts}
                isSingleAppMode
                id={activeViz.visualizationId}
              />
            )}
          </PromiseResult>
        </div>
      )}
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
