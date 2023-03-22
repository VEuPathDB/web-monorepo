import React from 'react';
import { AnalysisState } from '../hooks/analysis';
import { Analysis, NewAnalysis } from './analysis';
import { StudyMetadata } from './study';

/*
 * A FullScreenApp is an immersive view for a specific area of interest
 * (for example, a map-based view of a study).
 *
 * When a study includes a FullScreenApp, a trigger to open the view
 * will be rendered next to the entity diagram to open the view.
 */

export interface FullScreenComponentProps<T = unknown> {
  persistAppState: (appState: T) => void;
  appState: T;
  analysisState: AnalysisState;
}

export interface TriggerComponentTypes {
  analysis: Analysis | NewAnalysis;
}

export interface FullScreenAppPlugin<T = unknown> {
  triggerComponent: React.ComponentType<TriggerComponentTypes>;
  fullScreenComponent: React.ComponentType<FullScreenComponentProps<T>>;
  isCompatibleWithStudy: (study: StudyMetadata) => boolean;
}
