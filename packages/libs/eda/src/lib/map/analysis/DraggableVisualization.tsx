import { useState } from 'react';

import { AnalysisState, PromiseHookState } from '../../core';

import { AppState, useAppState } from './appState';
import {
  ComputationAppOverview,
  VisualizationOverview,
} from '../../core/types/visualization';
import { FullScreenVisualization } from '../../core/components/visualizations/VisualizationsContainer';
import { GeoConfig } from '../../core/types/geoConfig';
import { EntityCounts } from '../../core/hooks/entityCounts';
import { VariableDescriptor } from '../../core/types/variable';
import { Filter } from '../../core/types/filter';
import { FilledButton } from '@veupathdb/coreui';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import { ComputationPlugin } from '../../core/components/computations/Types';

interface Props {
  analysisState: AnalysisState;
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
  zIndexForStackingContext: number;
  additionalRenderCondition?: () => void;
}

export default function DraggableVisualization({
  analysisState,
  appState,
  setActiveVisualizationId,
  geoConfigs,
  apps,
  plugins,
  totalCounts,
  filteredCounts,
  toggleStarredVariable,
  filters,
  zIndexForStackingContext = 10,
  additionalRenderCondition,
}: Props) {
  const [hideInputsAndControls, setHideInputsAndControls] = useState(false);

  const { computation: activeComputation, visualization: activeViz } =
    analysisState.getVisualizationAndComputation(
      appState.activeVisualizationId
    ) ?? {};

  const computationType = activeComputation?.descriptor.type;

  const app = apps.find((a) => a.name === computationType);

  const activeVizOverview: VisualizationOverview | undefined =
    app?.visualizations.find((viz) => viz.name === activeViz?.descriptor.type);

  const visualizationPlugins = computationType
    ? plugins[computationType]?.visualizationPlugins
    : null;

  const shouldRenderVisualization =
    activeViz &&
    app &&
    visualizationPlugins &&
    (additionalRenderCondition ? additionalRenderCondition() : true);

  return shouldRenderVisualization ? (
    <DraggablePanel
      confineToParentContainer
      showPanelTitle
      isOpen
      styleOverrides={{ zIndex: zIndexForStackingContext, resize: 'both' }}
      panelTitle={activeVizOverview?.displayName || ''}
      defaultPosition={{
        x: 535,
        y: 220,
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
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 100,
            padding: '0.5rem',
          }}
        >
          <FilledButton
            text={hideInputsAndControls ? 'Show Controls' : 'Hide Controls'}
            onPress={() => setHideInputsAndControls(!hideInputsAndControls)}
          />
        </div>
        <FullScreenVisualization
          // options={{}}
          analysisState={analysisState}
          computation={activeComputation!}
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
          hideInputsAndControls={hideInputsAndControls}
        />
      </div>
    </DraggablePanel>
  ) : null;
}
