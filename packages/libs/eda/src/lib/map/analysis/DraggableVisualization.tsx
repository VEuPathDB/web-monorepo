import { AnalysisState, PromiseHookState } from '../../core';

import { AppState, useAppState } from './appState';
import {
  ComputationAppOverview,
  Visualization,
  VisualizationOverview,
} from '../../core/types/visualization';
import { FullScreenVisualization } from '../../core/components/visualizations/VisualizationsContainer';
import { GeoConfig } from '../../core/types/geoConfig';
import { EntityCounts } from '../../core/hooks/entityCounts';
import { VariableDescriptor } from '../../core/types/variable';
import { Filter } from '../../core/types/filter';
import { DraggablePanel } from '@veupathdb/coreui/dist/components/containers';
import { ComputationPlugin } from '../../core/components/computations/Types';

interface Props {
  analysisState: AnalysisState;
  updateVisualizations: (
    visualizations:
      | Visualization[]
      | ((visualizations: Visualization[]) => Visualization[])
  ) => void;
  setActiveVisualizationId: ReturnType<
    typeof useAppState
  >['setActiveVisualizationId'];
  appState: AppState;
  apps: ComputationAppOverview[];
  plugins: Partial<Record<string, ComputationPlugin>>;
  geoConfigs: GeoConfig[];
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  toggleStarredVariable: (variable: VariableDescriptor) => void;
  filters: Filter[];
}

export default function DraggableVisualization({
  analysisState,
  appState,
  updateVisualizations,
  setActiveVisualizationId,
  geoConfigs,
  apps,
  plugins,
  totalCounts,
  filteredCounts,
  toggleStarredVariable,
  filters,
}: Props) {
  const activeComputation =
    analysisState.analysis?.descriptor.computations.find((c) =>
      c.visualizations.some(
        (v) => v.visualizationId === appState.activeVisualizationId
      )
    );

  const activeViz = activeComputation?.visualizations.find(
    (v) => v.visualizationId === appState.activeVisualizationId
  );

  const computationType = activeComputation?.descriptor.type;

  const app = apps.find((a) => a.name === computationType);

  const activeVizOverview: VisualizationOverview | undefined =
    app?.visualizations.find((viz) => viz.name === activeViz?.descriptor.type);

  const visualizationPlugins = computationType
    ? plugins[computationType]?.visualizationPlugins
    : null;
  console.log({ visualizationPlugins, computationType, activeViz, apps });
  return (
    <>
      {activeViz && app && visualizationPlugins && (
        <DraggablePanel
          confineToParentContainer
          showPanelTitle
          isOpen
          styleOverrides={{ zIndex: 10, resize: 'both' }}
          panelTitle={activeVizOverview?.displayName || ''}
          defaultPosition={{
            x: 535,
            y: 142,
          }}
          onPanelDismiss={() => setActiveVisualizationId(undefined)}
        >
          <div
            style={{
              // Initial height & width.
              height: 547,
              width: 779,
              // This prevents the panel from collapsing aburdly.
              minWidth: 400,
              minHeight: 200,
            }}
          >
            <FullScreenVisualization
              analysisState={analysisState}
              computation={activeComputation!}
              updateVisualizations={updateVisualizations}
              visualizationPlugins={visualizationPlugins}
              visualizationsOverview={app.visualizations}
              geoConfigs={geoConfigs}
              computationAppOverview={app}
              filters={filters}
              starredVariables={
                analysisState.analysis?.descriptor.starredVariables ?? []
              }
              toggleStarredVariable={toggleStarredVariable}
              totalCounts={totalCounts}
              filteredCounts={filteredCounts}
              isSingleAppMode
              disableThumbnailCreation
              id={activeViz.visualizationId}
              actions={<></>}
              plugins={plugins}
            />
          </div>
        </DraggablePanel>
      )}
    </>
  );
}
