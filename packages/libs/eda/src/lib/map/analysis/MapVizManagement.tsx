import { useState, useCallback } from 'react';
import { FilledButton, FloatingButton } from '@veupathdb/coreui';

import { AnalysisState } from '../../core';
import { NewVisualizationPicker } from '../../core/components/visualizations/VisualizationsContainer';
import { useAppState } from './appState';
import {
  ComputationAppOverview,
  Visualization,
} from '../../core/types/visualization';
import { GeoConfig } from '../../core/types/geoConfig';
import { Add, CloseTwoTone } from '@material-ui/icons';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';

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
  app: ComputationAppOverview;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  geoConfigs: GeoConfig[];
}

export default function MapVizManagement({
  analysisState,
  updateVisualizations,
  setActiveVisualizationId,
  geoConfigs,
  app,
  visualizationPlugins,
}: Props) {
  const [isVizSelectorVisible, setIsVizSelectorVisible] = useState(false);

  const computation = analysisState.analysis?.descriptor.computations[0];

  const onVisualizationCreated = useCallback(
    (visualizationId: string) => {
      setIsVizSelectorVisible(false);
      setActiveVisualizationId(visualizationId);
    },
    [setActiveVisualizationId, setIsVizSelectorVisible]
  );

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <FilledButton
          text="New plot"
          size="small"
          icon={Add}
          textTransform="none"
          onPress={() => setIsVizSelectorVisible(true)}
        />
        <ul
          style={{
            // This will handle the (edge) case where a user's
            // plot is extremely length.
            maxWidth: 250,
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
      {isVizSelectorVisible && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <FloatingButton
            onPress={() => setIsVizSelectorVisible(false)}
            ariaLabel="Close the visualization menu"
            icon={CloseTwoTone}
            themeRole="secondary"
          />
          <NewVisualizationPicker
            includeHeader={false}
            computation={computation!}
            updateVisualizations={updateVisualizations}
            visualizationPlugins={visualizationPlugins}
            visualizationsOverview={app.visualizations}
            geoConfigs={geoConfigs}
            onVisualizationCreated={onVisualizationCreated}
          />
        </div>
      )}
    </div>
  );
}
