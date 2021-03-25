import { useSession, useStudyMetadata } from '../core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import React from 'react';
import HistogramViz from '../core/components/visualizations/HistogramViz';
import { Visualization, HistogramConfig } from '../core/types/visualization';

interface RouteProps {
  sessionId: string;
  visualizationId: string;
}

export default function VisualizationRoute(props: RouteProps) {
  const { sessionId, visualizationId } = props;
  const session = useSession(sessionId);
  const studyMetadata = useStudyMetadata();
  // const history = useHistory(); // TO DO?
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children || [])
  );

  const visualizations = session.session?.visualizations ?? [];

  const visualisation = visualizations.find(
    (viz) => viz.visualizationId === visualizationId
  ) ?? {
    visualizationId: visualizationId,
    type: 'histogram',
    enableOverlay: true,
  };

  const handleVizStateChange = (newState: Visualization) => {
    const newVisualizations = visualizations
      .filter((viz) => viz.visualizationId !== newState.visualizationId)
      .concat([newState]);
    session.setVisualizations(newVisualizations);
  };

  // return the appropriate Visualization component
  const Component = HistogramViz;

  return (
    <Component
      studyMetadata={studyMetadata}
      sessionState={session}
      vizConfig={visualisation as HistogramConfig}
      onVizConfigChange={handleVizStateChange}
      entities={entities}
    />
  );
}
