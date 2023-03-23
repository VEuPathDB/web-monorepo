import { useState, useCallback, useMemo } from 'react';
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
import { ComputationPlugin } from '../../core/components/computations/Types';
import { LayoutOptions } from '../../core/components/layouts/types';
import { OverlayOptions } from '../../core/components/visualizations/options/types';
import { FloatingLayout } from '../../core/components/layouts/FloatingLayout';
import { ZeroConfigWithButton } from '../../core/components/computations/ZeroConfiguration';
import { histogramVisualization } from '../../core/components/visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../../core/components/visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../core/components/visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../core/components/visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../../core/components/visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../core/components/visualizations/implementations/BoxplotVisualization';
import * as t from 'io-ts';
import { VariableDescriptor } from '../../core/types/variable';
import { Filter } from '../../core/types/filter';

interface Props {
  analysisState: AnalysisState;
  setActiveVisualizationId: ReturnType<
    typeof useAppState
  >['setActiveVisualizationId'];
  appState: AppState;
  app: ComputationAppOverview;
  geoConfigs: GeoConfig[];
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  toggleStarredVariable: (variable: VariableDescriptor) => void;
  filters: Filter[];
}

export default function FloatingVizManagement({
  analysisState,
  appState,
  setActiveVisualizationId,
  geoConfigs,
  app,
  totalCounts,
  filteredCounts,
  toggleStarredVariable,
  filters,
}: Props) {
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
        getOverlayVariable: (_) => appState.selectedOverlayVariable,
        getOverlayVariableHelp: () =>
          'The overlay variable can be selected via the top-right panel.',
        //        getCheckedLegendItems: (_) => appState.checkedLegendItems,
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
  }, [appState.selectedOverlayVariable]);

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

  return (
    <>
      <div>
        <FilledButton
          text="Add a Plot"
          textTransform="none"
          onPress={() => setIsVizSelectorVisible(true)}
        />
        <ul
          style={{
            // This will handle the (edge) case where a user's
            // plot is extremely length.
            maxWidth: 500,
            marginTop: '1rem',
          }}
        >
          {analysisState.analysis?.descriptor.computations.map(
            (computation) => (
              <li style={{ marginTop: '1rem' }} key={computation.computationId}>
                <strong>
                  {computation.displayName} ({computation.descriptor.type})
                </strong>
                <ul>
                  {computation.visualizations.map((viz) => (
                    <li
                      style={{ marginTop: '0.25rem' }}
                      key={viz.visualizationId}
                    >
                      <button
                        style={{ textAlign: 'left' }}
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
      </div>

      <NewVisualizationPickerModal
        visible={isVizSelectorVisible}
        onVisibleChange={setIsVizSelectorVisible}
        computation={computation!}
        updateVisualizations={updateVisualizations}
        visualizationPlugins={plugin.visualizationPlugins}
        visualizationsOverview={app.visualizations}
        geoConfigs={geoConfigs}
        onVisualizationCreated={onVisualizationCreated}
      />

      {activeViz && (
        <FloatingDiv
          style={{
            bottom: 10,
            left: 500,
            transformOrigin: 'bottom left',
            transform: 'scale(0.8)',
          }}
        >
          <FullScreenVisualization
            analysisState={analysisState}
            computation={computation!}
            updateVisualizations={updateVisualizations}
            visualizationPlugins={plugin.visualizationPlugins}
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
            actions={fullScreenActions}
          />
        </FloatingDiv>
      )}
    </>
  );
}
