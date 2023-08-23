import { ComponentType } from 'react';
import {
  AnalysisState,
  Filter,
  PromiseHookState,
  StudyEntity,
} from '../../../core';
import { GeoConfig } from '../../../core/types/geoConfig';
import { ComputationAppOverview } from '../../../core/types/visualization';
import { AppState } from '../appState';
import { DataClient, SubsettingClient } from '../../../core/api';
import { EntityCounts } from '../../../core/hooks/entityCounts';

export interface MapTypeConfigPanelProps {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: unknown) => void;
}

export interface MapTypeMapLayerProps<T> {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: unknown) => void;
  data: T;
  pending: boolean;
  error?: Error;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  filtersIncludingViewport: Filter[];
}

export interface GetDataProps extends MapTypeConfigPanelProps {
  dataClient: DataClient;
  subsettingClient: SubsettingClient;
}

/**
 * A plugin containing the pieces needed to render
 * and configure a map type
 */
export interface MapTypePlugin<T = unknown> {
  /**
   * Display name of map type used for menu, etc.
   */
  displayName: string;
  /**
   * Fetch and format data for use by MapLayerComponent and MapOverlayComponent
   */
  getData: (props: GetDataProps) => Promise<T>;
  /**
   * Returns a ReactNode used for configuring the map type
   */
  ConfigPanelComponent: ComponentType<MapTypeConfigPanelProps>;
  /**
   * Returns a ReactNode that is rendered as a leaflet map layer
   */
  MapLayerComponent?: ComponentType<MapTypeMapLayerProps<T>>;
  /**
   * Returns a ReactNode that is rendered on top of the map
   */
  MapOverlayComponent?: ComponentType<MapTypeMapLayerProps<T>>;
}
