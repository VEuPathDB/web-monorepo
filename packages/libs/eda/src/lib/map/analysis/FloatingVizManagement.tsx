import { useState, useCallback } from 'react';
import { FilledButton } from '@veupathdb/coreui';

import { AnalysisState, PromiseHookState } from '../../core';
import { FloatingDiv } from './FloatingDiv';
import {
  FullScreenVisualization,
  NewVisualizationPickerModal,
} from '../../core/components/visualizations/VisualizationsContainer';
import { AppState, useAppState } from './appState';
import {
  ComputationAppOverview,
  Visualization,
} from '../../core/types/visualization';
import { GeoConfig } from '../../core/types/geoConfig';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';

import { Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { EntityCounts } from '../../core/hooks/entityCounts';

interface Props {
  analysisState: AnalysisState;
  setActiveVisualizationId: ReturnType<
    typeof useAppState
  >['setActiveVisualizationId'];
  appState: AppState;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  app: ComputationAppOverview;
  geoConfigs: GeoConfig[];
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
}

export default function FloatingVizManagement({
  analysisState,
  appState,
  setActiveVisualizationId,
  visualizationPlugins,
  geoConfigs,
  app,
  totalCounts,
  filteredCounts,
}: Props) {
  const [isVizSelectorVisible, setIsVizSelectorVisible] = useState(false);

  const activeViz = analysisState.analysis?.descriptor.computations
    .flatMap((c) => c.visualizations)
    .find((v) => v.visualizationId === appState.activeVisualizationId);

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

  const fullScreenActions = (
    <>
      <div>
        <Tooltip title="Delete visualization">
          <button
            aria-label={`Delete ${activeViz?.displayName || 'visualization.'}`}
            type="button"
            className="link"
            onClick={() => {
              if (activeViz == null) return;
              updateVisualizations((visualizations) =>
                visualizations.filter(
                  (v) => v.visualizationId !== activeViz.visualizationId
                )
              );
              setActiveVisualizationId(undefined);
            }}
          >
            <i aria-hidden className="fa fa-trash"></i>
          </button>
        </Tooltip>
      </div>
      <div>
        <Tooltip title="Copy visualization">
          <button
            aria-label={`Create a copy of ${
              activeViz?.displayName || 'visualization.'
            }`}
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
            <i aria-hidden className="fa fa-clone"></i>
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
          <i aria-hidden className="fa fa-window-minimize" />
        </Link>
      </Tooltip>
    </>
  );

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  return (
    <>
      <FloatingDiv
        style={{
          top: 200,
          left: 200,
        }}
      >
        <FilledButton
          text="Add a plot"
          onPress={() => setIsVizSelectorVisible(true)}
        />
        <ul>
          {analysisState.analysis?.descriptor.computations.map(
            (computation) => (
              <li key={computation.computationId}>
                <strong>
                  {computation.displayName} ({computation.descriptor.type})
                </strong>
                <ul>
                  {computation.visualizations.map((viz) => (
                    <li key={viz.visualizationId}>
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

      <NewVisualizationPickerModal
        visible={isVizSelectorVisible}
        onVisibleChange={setIsVizSelectorVisible}
        computation={computation!}
        updateVisualizations={updateVisualizations}
        visualizationPlugins={visualizationPlugins}
        visualizationsOverview={app.visualizations}
        geoConfigs={geoConfigs}
        onVisualizationCreated={onVisualizationCreated}
      />

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
            <FullScreenVisualization
              analysisState={analysisState}
              computation={computation!}
              updateVisualizations={updateVisualizations}
              visualizationPlugins={visualizationPlugins}
              visualizationsOverview={app.visualizations}
              geoConfigs={geoConfigs}
              computationAppOverview={app}
              filters={
                analysisState.analysis?.descriptor.subset.descriptor ?? []
              }
              starredVariables={
                analysisState.analysis?.descriptor.starredVariables ?? []
              }
              toggleStarredVariable={toggleStarredVariable}
              totalCounts={totalCounts}
              filteredCounts={filteredCounts}
              isSingleAppMode
              disableThumbnailCreation
              id={activeViz.visualizationId}
              actions={fullScreenActions}
            />
          </div>
        )}
      </FloatingDiv>
    </>
  );
}
