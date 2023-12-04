import { ComponentType } from 'react';
import {
  AnalysisState,
  Filter,
  PromiseHookState,
  StudyEntity,
  StudyMetadata,
} from '../../../core';
import { GeoConfig } from '../../../core/types/geoConfig';
import { ComputationAppOverview } from '../../../core/types/visualization';
import { AppState, MarkerConfiguration } from '../appState';
import { EntityCounts } from '../../../core/hooks/entityCounts';
import { VariableDescriptor } from '../../../core/types/variable';

export interface MapTypeConfigPanelProps<T extends MarkerConfiguration> {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: T) => void;
  hideVizInputsAndControls: boolean;
  setHideVizInputsAndControls: (hide: boolean) => void;
}

export interface MapTypeMapLayerProps<T extends MarkerConfiguration> {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: T) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  filtersIncludingViewport: Filter[];
  hideVizInputsAndControls: boolean;
  setHideVizInputsAndControls: (hide: boolean) => void;
  // selectedMarkers and its state function
  selectedMarkers?: string[];
  setSelectedMarkers?: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * A plugin containing the pieces needed to render
 * and configure a map type
 */
export interface MapTypePlugin<T extends MarkerConfiguration> {
  /**
   * Display name of map type used for menu, etc.
   */
  displayName: string;
  /**
   * Returns a default configuration for this MapType. This is used to
   * create a set of default configurations for new analyses.
   */
  getDefaultConfig(props: {
    defaultVariable: VariableDescriptor;
    study: StudyMetadata;
  }): T;
  /**
   * Returns a ReactNode used for configuring the map type
   */
  ConfigPanelComponent: ComponentType<MapTypeConfigPanelProps<T>>;
  /**
   * Returns a ReactNode that is rendered as a leaflet map layer
   */
  MapLayerComponent?: ComponentType<MapTypeMapLayerProps<T>>;
  /**
   * Returns a ReactNode that is rendered on top of the map
   */
  MapOverlayComponent?: ComponentType<MapTypeMapLayerProps<T>>;
  /**
   * Returns a ReactNode that is rendered in the map header
   */
  MapTypeHeaderDetails?: ComponentType<MapTypeMapLayerProps<T>>;
}
