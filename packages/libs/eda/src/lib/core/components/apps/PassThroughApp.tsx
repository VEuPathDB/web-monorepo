import React, { useCallback } from 'react';
import { useSession } from '../../hooks/session';
import { Visualization } from '../../types/visualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';

interface Props {
  sessionId: string;
}

const visualizationTypes: VisualizationType[] = [
  {
    type: 'test',
    displayName: 'Test visualization',
    gridComponent: () => <div>Test in grid</div>,
    selectorComponent: () => <div>Test in selector</div>,
    fullscreenComponent: () => <div>Test in fullscreen</div>,
    createDefaultConfig: () => undefined,
  },
];

export function PassThroughApp(props: Props) {
  const { session, setVisualizations } = useSession(props.sessionId);
  const addVisualization = useCallback(
    (visualization: Visualization) => {
      setVisualizations([...(session?.visualizations ?? []), visualization]);
    },
    [setVisualizations, session]
  );
  if (session == null) return <div>Session not found</div>;
  return (
    <VisualizationsContainer
      appId="pass-through"
      apps={[
        {
          id: 'pass-through',
          type: 'pass',
          configuration: undefined,
        },
      ]}
      visualizations={session.visualizations}
      addVisualization={addVisualization}
      visualizationTypes={visualizationTypes}
    />
  );
}
