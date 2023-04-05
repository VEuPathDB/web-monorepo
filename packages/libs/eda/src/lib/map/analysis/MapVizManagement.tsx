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
import { useVizIconColors } from '../../core/components/visualizations/implementations/selectorIcons/types';
import PlaceholderIcon from '../../core/components/visualizations/PlaceholderIcon';

interface Props {
  activeVisualizationId: string | undefined;
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
  activeVisualizationId,
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
        <ul
          style={{
            margin: 0,
            listStyle: 'none',
          }}
        >
          {analysisState.analysis?.descriptor.computations.map(
            (computation) => (
              <li key={computation.computationId}>
                <ul style={{ listStyle: 'none', margin: 0 }}>
                  {computation.visualizations.map((viz) => (
                    <li
                      style={{ marginTop: '0.25rem' }}
                      key={viz.visualizationId}
                    >
                      <button
                        style={{
                          background:
                            activeVisualizationId === viz.visualizationId
                              ? 'red'
                              : 'unset',
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          width: '100%',
                        }}
                        onClick={() => {
                          setActiveVisualizationId(viz.visualizationId);
                        }}
                      >
                        {
                          <VizIconOrPlaceholder
                            type={viz.descriptor.type}
                            visualizationPlugins={visualizationPlugins}
                            iconProps={{
                              width: 20,
                            }}
                          />
                        }
                        <span
                          style={{
                            maxWidth: 250,
                            textAlign: 'left',
                            // Gives space between the icon and the viz name
                            marginLeft: 10,
                          }}
                        >
                          {viz.displayName}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            )
          )}
        </ul>

        <button
          style={{
            background: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
          onClick={() => setIsVizSelectorVisible(true)}
        >
          + Add plot
        </button>
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

function VizIconOrPlaceholder({ type, visualizationPlugins }: any) {
  const colors = useVizIconColors();

  const enabledPlugin = visualizationPlugins[type];

  return (
    <div style={{ width: 60 }} aria-label={type}>
      {enabledPlugin ? (
        <enabledPlugin.selectorIcon {...colors} />
      ) : (
        <PlaceholderIcon name={type} />
      )}
    </div>
  );
}
