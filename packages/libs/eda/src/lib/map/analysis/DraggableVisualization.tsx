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
import { ActiveVisualizationPanelConfig } from './mapTypes/shared';

interface Props {
  analysisState: AnalysisState;
  visualizationPanelConfig?: ActiveVisualizationPanelConfig;
  setActiveVisualizationPanelConfig: (
    activeVisualizationPanelConfig?: ActiveVisualizationPanelConfig
  ) => void;
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
}

export default function DraggableVisualization({
  analysisState,
  visualizationPanelConfig,
  setActiveVisualizationPanelConfig,
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
}: Props) {
  const { computation: activeComputation, visualization: activeViz } =
    analysisState.getVisualizationAndComputation(
      visualizationPanelConfig?.visualizationId
    ) ?? {};

  const computationType = activeComputation?.descriptor.type;

  const app = apps.find((a) => a.name === computationType);

  const activeVizOverview: VisualizationOverview | undefined =
    app?.visualizations.find((viz) => viz.name === activeViz?.descriptor.type);

  const computationPlugin = computationType
    ? plugins[computationType]
    : undefined;

  const visualizationPlugins = computationPlugin?.visualizationPlugins;

  const shouldRenderVisualization =
    visualizationPanelConfig &&
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
        height: visualizationPanelConfig.dimensions.height,
        width: visualizationPanelConfig.dimensions.width,
      }}
      panelTitle={activeVizOverview?.displayName || ''}
      defaultPosition={{
        x: 535,
        y: 220,
      }}
      onPanelDismiss={() => setActiveVisualizationPanelConfig(undefined)}
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
