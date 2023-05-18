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
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { DraggablePanel } from '@veupathdb/coreui/dist/components/containers';

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
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  app: ComputationAppOverview;
  geoConfigs: GeoConfig[];
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  toggleStarredVariable: (variable: VariableDescriptor) => void;
  filters: Filter[];
  onDragStart: () => void;
  zIndexForStackingContext: number;
}

export default function DraggableVisualization({
  analysisState,
  appState,
  updateVisualizations,
  setActiveVisualizationId,
  geoConfigs,
  app,
  visualizationPlugins,
  totalCounts,
  filteredCounts,
  toggleStarredVariable,
  filters,
  onDragStart = () => {},
  zIndexForStackingContext = 10,
}: Props) {
  const [computation, activeViz] =
    analysisState.analysis?.descriptor.computations
      .flatMap((c) => c.visualizations.map((v) => [c, v] as const))
      .find(([c, v]) => v.visualizationId === appState.activeVisualizationId) ??
    [];

  const activeVizOverview: VisualizationOverview | undefined =
    app.visualizations.find((viz) => viz.name === activeViz?.descriptor.type);

  return (
    <>
      {activeViz && (
        <DraggablePanel
          confineToParentContainer
          showPanelTitle
          isOpen
          styleOverrides={{ zIndex: zIndexForStackingContext, resize: 'both' }}
          panelTitle={activeVizOverview?.displayName || ''}
          defaultPosition={{
            x: 535,
            y: 142,
          }}
          onPanelDismiss={() => setActiveVisualizationId(undefined)}
          onDragStart={onDragStart}
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
              computation={computation!}
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
            />
          </div>
        </DraggablePanel>
      )}
    </>
  );
}
