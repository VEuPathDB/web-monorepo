import React, { useCallback, useMemo } from 'react';
import { useSession } from '../../hooks/session';
import { Visualization } from '../../types/visualization';
import { testVisualization } from '../visualizations/implementations/TestVisualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';

interface Props {
  sessionId: string;
}

const visualizationTypes: VisualizationType[] = [testVisualization];

export function PassThroughApp(props: Props) {
  const { session, setVisualizations } = useSession(props.sessionId);
  const addVisualization = useCallback(
    (visualization: Visualization) => {
      setVisualizations([...(session?.visualizations ?? []), visualization]);
    },
    [setVisualizations, session]
  );
  const filters = useMemo(() => session?.filters ?? [], [session?.filters]);
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
      filters={filters}
    />
  );
}
