import { AnalysisState, PromiseHookState } from '../../core';

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
import { PanelConfig } from './Types';

interface Props {
  analysisState: AnalysisState;
  visualizationId?: string;
  apps: ComputationAppOverview[];
  plugins: Partial<Record<string, ComputationPlugin>>;
  geoConfigs: GeoConfig[];
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  toggleStarredVariable: (variable: VariableDescriptor) => void;
  filters: Filter[];
  zIndexForStackingContext: number;
  additionalRenderCondition?: () => void;
  hideInputsAndControls: boolean;
  setHideInputsAndControls: (value: boolean) => void;
  defaultPosition: PanelConfig['position'];
  onDragComplete: (position: PanelConfig['position']) => void;
  onPanelResize: (dimensions: PanelConfig['dimensions']) => void;
  dimensions: PanelConfig['dimensions'];
  onPanelDismiss: () => void;
}

export default function DraggableVisualization({
  analysisState,
  visualizationId,
  geoConfigs,
  apps,
  plugins,
  totalCounts,
  filteredCounts,
  toggleStarredVariable,
  filters,
  zIndexForStackingContext = 10,
  additionalRenderCondition,
  hideInputsAndControls,
  setHideInputsAndControls,
  defaultPosition,
  onDragComplete,
  onPanelResize,
  dimensions,
  onPanelDismiss,
}: Props) {
  const { computation: activeComputation, visualization: activeViz } =
    analysisState.getVisualizationAndComputation(visualizationId) ?? {};

  const computationType = activeComputation?.descriptor.type;

  const app = apps.find((a) => a.name === computationType);

  const activeVizOverview: VisualizationOverview | undefined =
    app?.visualizations.find((viz) => viz.name === activeViz?.descriptor.type);

  const computationPlugin = computationType
    ? plugins[computationType]
    : undefined;

  const visualizationPlugins = computationPlugin?.visualizationPlugins;

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
      styleOverrides={{
        zIndex: zIndexForStackingContext,
        resize: 'both',
        overflow: 'hidden',
        width: dimensions.width,
        height: dimensions.height,
      }}
      panelTitle={activeVizOverview?.displayName || ''}
      defaultPosition={defaultPosition}
      onDragComplete={onDragComplete}
      onPanelDismiss={onPanelDismiss}
      onPanelResize={onPanelResize}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            zIndex: 100,
            padding: '0.5rem',
          }}
        >
          <FilledButton
            text={hideInputsAndControls ? 'Show controls' : 'Hide controls'}
            onPress={() => setHideInputsAndControls(!hideInputsAndControls)}
            size="small"
            textTransform="none"
          />
        </div>
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
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
              computationPlugin={computationPlugin}
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
              plotContainerStyleOverrides={
                hideInputsAndControls
                  ? { border: 'none', boxShadow: 'none' }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </DraggablePanel>
  ) : null;
}
